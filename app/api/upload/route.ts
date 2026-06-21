import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { put } from '@vercel/blob'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const blob = await put(file.name, Buffer.from(arrayBuffer), {
        access: 'public',
        addRandomSuffix: true,
        contentType: file.type || 'application/octet-stream',
      })
      return NextResponse.json({ url: blob.url })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[upload] Vercel Blob error:', message)
      return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 })
    }
  }

  // Local dev fallback
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const ext = path.extname(file.name) || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[upload] Local fallback error:', message)
    return NextResponse.json({ error: 'Upload failed', detail: message }, { status: 500 })
  }
}
