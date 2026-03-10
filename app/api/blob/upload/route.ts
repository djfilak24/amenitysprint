import { put } from '@vercel/blob'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Create a path with the folder structure
    const filename = `${folder}/${Date.now()}-${file.name}`

    // Upload to public blob storage
    const blob = await put(filename, file, {
      access: 'public',
    })

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
