import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const contentType = req.headers.get('content-type') || ''

  // Vercel Blob client-side upload — handles token generation and upload-completed callback
  if (process.env.BLOB_READ_WRITE_TOKEN && contentType.includes('application/json')) {
    try {
      const body = (await req.json()) as HandleUploadBody
      const jsonResponse = await handleUpload({
        body,
        request: req,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
        }),
        onUploadCompleted: async ({ blob }: { blob: { url: string } }) => {
          console.log('Blob upload completed:', blob.url)
        },
      })
      return NextResponse.json(jsonResponse)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('Vercel Blob handleUpload error:', message)
      return NextResponse.json({ error: message }, { status: 400 })
    }
  }

  // Local dev fallback — save to public/uploads/
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error('Local upload error:', err)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
