import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

type CopilotIntent = 'buy' | 'rent' | 'sell' | 'popular' | 'nearby' | 'general'

function parseIntent(question: string): CopilotIntent {
  const q = question.toLowerCase()
  if (q.includes('rent') || q.includes('rental') || q.includes('lease')) return 'rent'
  if (q.includes('sell') || q.includes('list my property')) return 'sell'
  if (q.includes('popular') || q.includes('best') || q.includes('top')) return 'popular'
  if (q.includes('near') || q.includes('nearby') || q.includes('closest')) return 'nearby'
  if (q.includes('buy') || q.includes('purchase')) return 'buy'
  return 'general'
}

function runGuardrails(question: string): { sanitized: string; notes: string[] } {
  const notes: string[] = []
  let sanitized = question.trim()
  if (sanitized.length > 600) {
    sanitized = sanitized.slice(0, 600)
    notes.push('Truncated long prompt.')
  }
  const blocked = ['hack', 'exploit', 'bypass']
  if (blocked.some((w) => sanitized.toLowerCase().includes(w))) {
    notes.push('Blocked unsafe intent keywords.')
    sanitized = 'Show me available properties'
  }
  return { sanitized, notes }
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const question = searchParams.get('question')?.trim()
  if (!question) return NextResponse.json({ error: 'question is required' }, { status: 400 })

  const { sanitized, notes } = runGuardrails(question)
  const intent = parseIntent(sanitized)
  const steps: string[] = []

  const city = searchParams.get('city')
  const status = searchParams.get('status')
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null
  const bedrooms = searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : null
  const latitude = searchParams.get('latitude') ? Number(searchParams.get('latitude')) : null
  const longitude = searchParams.get('longitude') ? Number(searchParams.get('longitude')) : null

  const where: Record<string, unknown> = {}
  if (intent === 'rent') where.status = 'rental'
  else if (intent !== 'sell') where.status = status || 'for_sale'
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (minPrice) where.price = { ...((where.price as object) || {}), gte: minPrice }
  if (maxPrice) where.price = { ...((where.price as object) || {}), lte: maxPrice }
  if (bedrooms) where.bedrooms = { gte: bedrooms }
  if (intent === 'popular') where.isPopular = true

  steps.push(`Intent: ${intent}`, `Filters: ${JSON.stringify(where)}`)

  const rawProperties = await prisma.property.findMany({
    where,
    orderBy: [{ isPopular: 'desc' }, { createdAt: 'desc' }],
    take: 10,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      city: true,
      address: true,
      bedrooms: true,
      bathrooms: true,
      isPopular: true,
      rating: true,
      latitude: true,
      longitude: true,
    },
  })

  let properties = rawProperties.map((p) => {
    const why: string[] = []
    if (p.isPopular) why.push('Popular listing')
    if (p.rating && p.rating >= 4) why.push(`Rated ${p.rating}/5`)
    if (latitude && longitude && p.latitude && p.longitude) {
      const d = distanceKm(latitude, longitude, p.latitude, p.longitude)
      if (d < 10) why.push(`Only ${d.toFixed(1)}km away`)
    }
    return { ...p, why, overallRating: p.rating }
  })

  if (intent === 'nearby' && latitude && longitude) {
    properties = properties
      .filter((p) => p.latitude && p.longitude)
      .sort((a, b) => {
        const da = distanceKm(latitude, longitude, a.latitude!, a.longitude!)
        const db = distanceKm(latitude, longitude, b.latitude!, b.longitude!)
        return da - db
      })
      .slice(0, 5)
  }

  const intentMessages: Record<CopilotIntent, string> = {
    buy: `Here are properties available for purchase${city ? ` in ${city}` : ''}.`,
    rent: `Here are rental properties${city ? ` in ${city}` : ''}.`,
    sell: 'To list your property with us, please use the contact form or WhatsApp us directly.',
    popular: `Here are our most popular properties${city ? ` in ${city}` : ''}.`,
    nearby: latitude ? 'Here are properties near your location.' : 'Please share your location for nearby results.',
    general: `Here are some properties that might interest you${city ? ` in ${city}` : ''}.`,
  }

  return NextResponse.json({
    answer: intentMessages[intent],
    intent,
    properties: properties.slice(0, 5),
    trace: { guardrails: notes, queryTerms: [sanitized], steps },
  })
}
