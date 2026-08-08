import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id || (session.user as any).role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const address = req.nextUrl.searchParams.get('address')?.trim()
  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  const key = process.env.GOOGLE_GEOCODING_API_KEY
  if (!key) {
    return NextResponse.json(
      { error: 'Google Geocoding API key not configured (GOOGLE_GEOCODING_API_KEY).' },
      { status: 500 }
    )
  }

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
  )
  const data = await res.json()

  if (data.status === 'OK' && data.results[0]) {
    const { lat, lng } = data.results[0].geometry.location
    return NextResponse.json({ lat, lng })
  }

  return NextResponse.json({ error: 'Could not find coordinates for this address.' }, { status: 404 })
}
