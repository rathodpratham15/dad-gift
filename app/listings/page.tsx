import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import ListingsClient from './listings-client'

export const metadata: Metadata = { title: 'Property Listings' }

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ListingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const session = await auth()
  const user = session?.user ? { firstName: (session.user as any).firstName, role: (session.user as any).role } : null

  const page = parseInt(params.page || '1')
  const limit = 12
  const search = params.search || null
  const sort = params.sort || 'popular'
  const propertyType = params.propertyType || null
  const status = params.status || 'for_sale'
  const city = params.city || null
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : null
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : null
  const bedrooms = params.bedrooms ? parseInt(params.bedrooms) : null
  const popularOnly = params.popularOnly === 'true'
  const latitude = params.latitude ? parseFloat(params.latitude) : null
  const longitude = params.longitude ? parseFloat(params.longitude) : null
  const radiusKm = params.radiusKm ? parseFloat(params.radiusKm) : 25

  const where: Record<string, unknown> = { status }
  if (propertyType) where.propertyType = propertyType
  if (city) where.city = { contains: city, mode: 'insensitive' }
  if (minPrice || maxPrice) where.price = { ...(minPrice ? { gte: minPrice } : {}), ...(maxPrice ? { lte: maxPrice } : {}) }
  if (bedrooms) where.bedrooms = { gte: bedrooms }
  if (popularOnly) where.isPopular = true
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } },
      { city: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (latitude && longitude) {
    where.latitude = { not: null }
    where.longitude = { not: null }
  }

  let orderBy: Record<string, string> | Record<string, string>[] = [{ isPopular: 'desc' }, { createdAt: 'desc' }]
  if (sort === 'price_low') orderBy = { price: 'asc' }
  else if (sort === 'price_high') orderBy = { price: 'desc' }
  else if (sort === 'latest') orderBy = { createdAt: 'desc' }

  const [total, rawProperties, citiesRaw] = await Promise.all([
    prisma.property.count({ where }),
    prisma.property.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.property.findMany({ where: { city: { not: '' } }, select: { city: true }, distinct: ['city'], orderBy: { city: 'asc' } }),
  ])

  let properties = rawProperties.map((p) => ({
    ...p,
    images: (p.images as string[]) || [],
    features: p.features as Record<string, unknown> | null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    distanceKm: latitude && longitude && p.latitude && p.longitude
      ? Number(distanceKm(latitude, longitude, p.latitude, p.longitude).toFixed(1))
      : null,
  }))

  if (sort === 'distance' && latitude && longitude) {
    properties = properties.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
  }

  if (latitude && longitude) {
    properties = properties.filter((p) => p.distanceKm === null || p.distanceKm <= radiusKm)
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <ListingsClient
        properties={{
          data: properties as any,
          meta: { currentPage: page, lastPage: Math.ceil(total / limit), perPage: limit, total },
        }}
        filters={{ search, sort, popularOnly, propertyType, status, city, minPrice: params.minPrice || null, maxPrice: params.maxPrice || null, bedrooms: params.bedrooms || null, latitude, longitude, radiusKm }}
        cities={citiesRaw.map((c) => c.city).filter(Boolean) as string[]}
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null}
        defaultMapCenter={{
          lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_LAT || '19.076'),
          lng: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_MAP_LNG || '72.8777'),
        }}
      />
      <Footer />
    </div>
  )
}
