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

  // Cloudinary — works on any host, preferred for self-hosted deployments
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_UPLOAD_PRESET) {
    try {
      const cloudForm = new FormData()
      cloudForm.append('file', file)
      cloudForm.append('upload_preset', process.env.CLOUDINARY_UPLOAD_PRESET)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: cloudForm }
      )

      if (!res.ok) {
        const errText = await res.text()
        console.error('Cloudinary upload failed:', errText)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
      }

      const data = await res.json()
      return NextResponse.json({ url: data.secure_url })
    } catch (err) {
      console.error('Cloudinary upload error:', err)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  }

  // Vercel Blob
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
      console.error('Vercel Blob upload error:', message)
      return NextResponse.json({ error: 'Vercel Blob upload failed', detail: message }, { status: 500 })
    }
  }

  // Local dev fallback — save to public/uploads/
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
    console.error('Local upload error:', err)
    return NextResponse.json(
      { error: 'Upload failed — set CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET on the server' },
      { status: 500 }
    )
  }
}
