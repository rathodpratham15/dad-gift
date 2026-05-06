import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

// Switch provider: AI_PROVIDER=openai | anthropic | gemini | groq  (default: groq)
const PROVIDER = (['openai', 'anthropic', 'gemini', 'groq'].includes(process.env.AI_PROVIDER ?? '')
  ? process.env.AI_PROVIDER
  : 'groq') as 'openai' | 'anthropic' | 'gemini' | 'groq'

const OPENAI_COMPAT_CONFIGS = {
  openai: { apiKey: process.env.OPENAI_API_KEY ?? '', baseURL: undefined, model: 'gpt-4o-mini' },
  groq:   { apiKey: process.env.GROQ_API_KEY ?? '',   baseURL: 'https://api.groq.com/openai/v1', model: 'llama-3.1-8b-instant' },
}

const openaiClient = ['openai', 'groq'].includes(PROVIDER)
  ? new OpenAI({ ...OPENAI_COMPAT_CONFIGS[PROVIDER as 'openai' | 'groq'] })
  : null
const anthropic = PROVIDER === 'anthropic' ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null
const gemini    = PROVIDER === 'gemini'    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '') : null

async function callAI(system: string, user: string, maxTokens: number): Promise<string> {
  if (PROVIDER === 'anthropic' && anthropic) {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    })
    return res.content[0].type === 'text' ? res.content[0].text : ''
  }

  if (PROVIDER === 'gemini' && gemini) {
    const model = gemini.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction: system,
    })
    const res = await model.generateContent(user)
    return res.response.text()
  }

  // openai or groq
  const config = OPENAI_COMPAT_CONFIGS[PROVIDER as 'openai' | 'groq']
  const res = await openaiClient!.chat.completions.create({
    model: config.model,
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

  // Step 1: Extract structured filters from natural language
  let filters: {
    city?: string | null
    status?: 'for_sale' | 'rental' | null
    minPrice?: number | null
    maxPrice?: number | null
    minBedrooms?: number | null
    nearby?: boolean
  } = {}

  try {
    const raw = await callAI(
      `You are a real estate search assistant. Extract search filters from the user's query and return ONLY valid JSON with these optional fields:
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
      question,
      300
    )
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
      id: true, title: true, slug: true, price: true, city: true,
      address: true, bedrooms: true, bathrooms: true, squareFeet: true,
      isPopular: true, rating: true, latitude: true, longitude: true, status: true,
    },
  })

  let properties = rawProperties
  if (userLat && userLon && filters.nearby) {
    properties = rawProperties
      .filter((p) => p.latitude && p.longitude)
      .sort((a, b) =>
        distanceKm(userLat, userLon, a.latitude!, a.longitude!) -
        distanceKm(userLat, userLon, b.latitude!, b.longitude!)
      )
  }

  const top5 = properties.slice(0, 5)

  // Step 3: Generate a natural language answer
  const propertyList =
    top5.length > 0
      ? top5.map((p, i) =>
          `${i + 1}. ${p.title} — ₹${p.price.toLocaleString('en-IN')}, ${p.bedrooms}BR/${p.bathrooms}BA, ${p.city}${p.squareFeet ? `, ${p.squareFeet} sq ft` : ''}${p.isPopular ? ', ⭐ Popular' : ''}`
        ).join('\n')
      : 'No properties found matching these criteria.'

  const answer = await callAI(
    `You are a friendly real estate assistant for Realest, an Indian property platform.
Write a concise 1-2 sentence response to the user's query based on the search results.
Be conversational and specific. If no results, suggest broadening the search criteria.
Do not list the properties — just summarize naturally.`,
    `User asked: "${question}"\n\nSearch results:\n${propertyList}`,
    150
  )

  return NextResponse.json({
    answer: answer || (top5.length > 0 ? `Found ${top5.length} properties matching your search.` : 'No properties found. Try broadening your search.'),
    properties: top5,
    filters,
  })
}
