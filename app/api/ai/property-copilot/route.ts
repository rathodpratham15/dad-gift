import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

// Switch provider: AI_PROVIDER=openai | anthropic | gemini | groq  (default: groq)
const PROVIDER = (['openai', 'anthropic', 'gemini', 'groq'].includes(process.env.AI_PROVIDER ?? '')
  ? process.env.AI_PROVIDER
  : 'groq') as 'openai' | 'anthropic' | 'gemini' | 'groq'

async function callAI(system: string, user: string, maxTokens: number): Promise<string> {
  if (PROVIDER === 'anthropic') {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    })
    return res.content[0].type === 'text' ? res.content[0].text : ''
  }

  if (PROVIDER === 'gemini') {
    const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '')
    const model = client.getGenerativeModel({ model: 'gemini-2.0-flash-lite', systemInstruction: system })
    const res = await model.generateContent(user)
    return res.response.text()
  }

  const configs = {
    openai: { apiKey: process.env.OPENAI_API_KEY ?? '', baseURL: undefined,                         model: 'gpt-4o-mini'          },
    groq:   { apiKey: process.env.GROQ_API_KEY   ?? '', baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant' },
  }
  const cfg = configs[PROVIDER as 'openai' | 'groq']
  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL })
  const res = await client.chat.completions.create({
    model: cfg.model,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  })
  return res.choices[0].message.content ?? ''
}

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

  // Step 1: AI extracts structured filters from natural language
  let filters: {
    city?: string | null
    status?: 'for_sale' | 'rental' | null
    propertyType?: string | null
    minPrice?: number | null
    maxPrice?: number | null
    minBedrooms?: number | null
    maxBedrooms?: number | null
    minSquareFeet?: number | null
    maxSquareFeet?: number | null
    furnishing?: string | null
    facing?: string | null
    nearby?: boolean
    requiredAmenities?: string[]
  } = {}

  try {
    const raw = await callAI(
      `You are a real estate search assistant for an Indian property platform. Extract search filters from the user's query and return ONLY valid JSON with these optional fields:
{
  "city": string or null,
  "status": "for_sale" | "rental" | null,
  "propertyType": "apartment" | "house" | "villa" | "shop" | "godown" | "land" | "commercial" | null,
  "minPrice": number or null,
  "maxPrice": number or null,
  "minBedrooms": number or null,
  "maxBedrooms": number or null,
  "minSquareFeet": number or null,
  "maxSquareFeet": number or null,
  "furnishing": "unfurnished" | "semi_furnished" | "fully_furnished" | null,
  "facing": "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west" | null,
  "nearby": boolean,
  "requiredAmenities": string[]
}
Rules:
- Indian prices: "1 lakh"=100000, "1 crore"=10000000, "1.5 crore"=15000000, "1.85 crore"=18500000, "50L"=5000000
- "under/below X crore" → maxPrice = X*10000000; "above/more than X lakh" → minPrice = X*100000
- renting/lease/rent → "rental"; buying/sale/purchase → "for_sale"; null if unclear
- "2BHK"/"2 bedroom" → minBedrooms:2, maxBedrooms:2; "3+ BHK" → minBedrooms:3
- "flat"/"apartment"/"flats" → propertyType:"apartment"; "bungalow"/"independent house" → "house"
- "furnished" → "fully_furnished"; "semi-furnished" → "semi_furnished"; "unfurnished" → "unfurnished"
- requiredAmenities keys: parking, swimming_pool, gym, garden, security, lift, power_backup, club_house, intercom, cctv, air_conditioning, modular_kitchen, play_area, jogging_track
  "with parking" → ["parking"], "pool and gym" → ["swimming_pool","gym"], none mentioned → []
- Return ONLY the JSON object, no explanation, no markdown`,
      question,
      400
    )
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim()
    filters = JSON.parse(cleaned)
  } catch {
    filters = {}
  }

  // Step 2: Query DB with extracted filters
  const where: Record<string, unknown> = {}
  if (filters.status) where.status = filters.status
  if (filters.propertyType) where.propertyType = filters.propertyType
  if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' }
  if (filters.furnishing) where.furnishing = filters.furnishing
  if (filters.facing) where.facing = filters.facing
  if (filters.minPrice || filters.maxPrice) {
    where.price = {
      ...(filters.minPrice ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
    }
  }
  if (filters.minBedrooms || filters.maxBedrooms) {
    where.bedrooms = {
      ...(filters.minBedrooms ? { gte: filters.minBedrooms } : {}),
      ...(filters.maxBedrooms ? { lte: filters.maxBedrooms } : {}),
    }
  }
  if (filters.minSquareFeet || filters.maxSquareFeet) {
    where.squareFeet = {
      ...(filters.minSquareFeet ? { gte: filters.minSquareFeet } : {}),
      ...(filters.maxSquareFeet ? { lte: filters.maxSquareFeet } : {}),
    }
  }

  const rawProperties = await prisma.property.findMany({
    where,
    orderBy: [{ isPopular: 'desc' }, { createdAt: 'desc' }],
    take: 20,
    select: {
      id: true, title: true, slug: true, price: true, city: true,
      address: true, bedrooms: true, bathrooms: true, squareFeet: true,
      isPopular: true, rating: true, latitude: true, longitude: true, status: true,
      features: true,
    },
  })

  // Post-filter by required amenities (features JSON)
  const requiredAmenities = filters.requiredAmenities ?? []
  let properties = requiredAmenities.length > 0
    ? rawProperties.filter((p) => {
        const f = (p.features ?? {}) as Record<string, unknown>
        return requiredAmenities.every((amenity) => f[amenity] === true)
      })
    : rawProperties

  if (userLat && userLon && filters.nearby) {
    properties = properties
      .filter((p) => p.latitude && p.longitude)
      .sort((a, b) =>
        distanceKm(userLat, userLon, a.latitude!, a.longitude!) -
        distanceKm(userLat, userLon, b.latitude!, b.longitude!)
      )
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const top5 = properties.slice(0, 5).map(({ features: _f, ...p }) => p)

  // Step 3: AI generates natural language answer
  const propertyList =
    top5.length > 0
      ? top5.map((p, i) =>
          `${i + 1}. ${p.title} — ₹${p.price.toLocaleString('en-IN')}, ${p.bedrooms ?? '?'}BR/${p.bathrooms ?? '?'}BA, ${p.city}${p.squareFeet ? `, ${p.squareFeet} sq ft` : ''}${p.isPopular ? ', ⭐ Popular' : ''}`
        ).join('\n')
      : 'No properties found matching these criteria.'

  const answer = await callAI(
    `You are a friendly real estate assistant for Realest, an Indian property platform.
Write a concise 1-2 sentence response to the user's query based on the search results.
Be conversational and specific. Use Indian price terms (lakh/crore) when mentioning prices.
IMPORTANT price conversions: 1 crore = 10 million, so 20 million = 2 crore, 10 million = 1 crore.
Always derive price references from the extracted filters, not from re-parsing the user's question.
If no results, suggest broadening the search criteria. Do not list properties — just summarize.`,
    `User asked: "${question}"\n\nExtracted filters (use these for accurate price references): ${JSON.stringify(filters)}\n\nSearch results:\n${propertyList}`,
    150
  )

  return NextResponse.json({
    answer: answer || (top5.length > 0
      ? `Found ${top5.length} properties matching your search.`
      : 'No properties found. Try broadening your search.'),
    properties: top5,
    filters,
  })
}
