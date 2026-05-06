import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const question = searchParams.get('question')?.trim()
  if (!question) return NextResponse.json({ error: 'question is required' }, { status: 400 })

  const userLat = searchParams.get('latitude') ? Number(searchParams.get('latitude')) : null
  const userLon = searchParams.get('longitude') ? Number(searchParams.get('longitude')) : null

  // Step 1: Claude extracts structured filters from natural language
  const extractionResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: `You are a real estate search assistant. Extract search filters from the user's query and return ONLY valid JSON with these optional fields:
{
  "city": string or null,
  "status": "for_sale" | "rental" | null,
  "minPrice": number or null,
  "maxPrice": number or null,
  "minBedrooms": number or null,
  "nearby": boolean
}
Rules:
- Prices are in Indian Rupees. Convert "1 crore" = 10000000, "1 lakh" = 100000
- renting/lease → status: "rental", buying/purchase → status: "for_sale", null if unclear
- Return ONLY the JSON object, no explanation`,
    messages: [{ role: 'user', content: question }],
  })

  let filters: {
    city?: string | null
    status?: 'for_sale' | 'rental' | null
    minPrice?: number | null
    maxPrice?: number | null
    minBedrooms?: number | null
    nearby?: boolean
  } = {}

  try {
    const raw = extractionResponse.content[0].type === 'text' ? extractionResponse.content[0].text : '{}'
    filters = JSON.parse(raw)
  } catch {
    filters = {}
  }

  // Step 2: Query the database with extracted filters
  const where: Record<string, unknown> = {}
  if (filters.status) where.status = filters.status
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' }
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    }
  }
  if (filters.minBedrooms) where.bedrooms = { gte: filters.minBedrooms }

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
      squareFeet: true,
      isPopular: true,
      rating: true,
      latitude: true,
      longitude: true,
      status: true,
    },
  })

  // Sort by distance if user location available and nearby requested
  let properties = rawProperties
  if (userLat && userLon && filters.nearby) {
    properties = rawProperties
      .filter((p) => p.latitude && p.longitude)
      .sort((a, b) => {
        const da = distanceKm(userLat, userLon, a.latitude!, a.longitude!)
        const db = distanceKm(userLat, userLon, b.latitude!, b.longitude!)
        return da - db
      })
  }

  const top5 = properties.slice(0, 5)

  // Step 3: Claude generates a natural language answer based on results
  const propertyList =
    top5.length > 0
      ? top5
          .map(
            (p, i) =>
              `${i + 1}. ${p.title} — ₹${p.price.toLocaleString('en-IN')}, ${p.bedrooms}BR/${p.bathrooms}BA, ${p.city}${p.squareFeet ? `, ${p.squareFeet} sq ft` : ''}${p.isPopular ? ', ⭐ Popular' : ''}`
          )
          .join('\n')
      : 'No properties found matching these criteria.'

  const answerResponse = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    system: `You are a friendly real estate assistant for Realest, an Indian property platform.
Write a concise 1-2 sentence response to the user's query based on the search results.
Be conversational and specific. If no results, suggest broadening the search criteria.
Do not list the properties — just summarize naturally.`,
    messages: [
      {
        role: 'user',
        content: `User asked: "${question}"\n\nSearch results:\n${propertyList}`,
      },
    ],
  })

  const answer =
    answerResponse.content[0].type === 'text'
      ? answerResponse.content[0].text
      : top5.length > 0
        ? `Found ${top5.length} properties matching your search.`
        : 'No properties found. Try broadening your search.'

  return NextResponse.json({ answer, properties: top5, filters })
}
