import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import PropertyDetailClient from './property-detail-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const property = await prisma.property.findUnique({ where: { slug } })
  if (!property) return { title: 'Property Not Found' }
  const description = property.description
    ? property.description.slice(0, 155)
    : `${property.propertyType} in ${property.city}, ${property.state}. Listed at ${property.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}.`
  return {
    title: property.title,
    description,
    openGraph: {
      title: property.title,
      description,
      images: property.mainImage ? [{ url: property.mainImage, alt: property.title }] : [],
      url: `https://realestate.pratham.click/listings/${slug}`,
    },
    alternates: { canonical: `https://realestate.pratham.click/listings/${slug}` },
  }
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  const user = session?.user
    ? { firstName: (session.user as any).firstName, role: (session.user as any).role }
    : null

  const rawProperty = await prisma.property.findUnique({
    where: { slug },
    include: {
      testimonials: true,
    },
  })

  if (!rawProperty) {
    notFound()
  }

  const [similarPropertiesRaw, candidatesForNearby] = await Promise.all([
    prisma.property.findMany({
      where: {
        propertyType: rawProperty.propertyType,
        id: { not: rawProperty.id },
        status: 'for_sale',
      },
      take: 4,
    }),
    rawProperty.latitude && rawProperty.longitude
      ? prisma.property.findMany({
          where: {
            id: { not: rawProperty.id },
            latitude: { not: null },
            longitude: { not: null },
          },
        })
      : Promise.resolve([]),
  ])

  // Serialize dates
  const property = {
    ...rawProperty,
    images: (rawProperty.images as string[]) || [],
    videos: (rawProperty.videos as string[]) || [],
    features: rawProperty.features as Record<string, unknown> | null,
    createdAt: rawProperty.createdAt.toISOString(),
    updatedAt: rawProperty.updatedAt.toISOString(),
  }

  const propertyTestimonials = rawProperty.testimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }))

  const similarProperties = similarPropertiesRaw.map((p) => ({
    ...p,
    images: (p.images as string[]) || [],
    videos: (p.videos as string[]) || [],
    features: p.features as Record<string, unknown> | null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  const nearbyProperties = rawProperty.latitude && rawProperty.longitude
    ? candidatesForNearby
        .map((p) => ({
          ...p,
          distance: haversineKm(
            rawProperty.latitude!,
            rawProperty.longitude!,
            p.latitude as number,
            p.longitude as number,
          ),
        }))
        .filter((p) => p.distance < 15)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 4)
        .map(({ distance: _d, ...p }) => ({
          ...p,
          images: (p.images as string[]) || [],
          videos: (p.videos as string[]) || [],
          features: p.features as Record<string, unknown> | null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        }))
    : []

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+919876543210'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: rawProperty.title,
    description: rawProperty.description ?? undefined,
    url: `https://realestate.pratham.click/listings/${rawProperty.slug}`,
    image: rawProperty.mainImage ?? undefined,
    offers: {
      '@type': 'Offer',
      price: rawProperty.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: rawProperty.address,
      addressLocality: rawProperty.city,
      addressRegion: rawProperty.state,
      postalCode: rawProperty.zipCode,
      addressCountry: rawProperty.country,
    },
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar user={user} />
      <PropertyDetailClient
        property={property as any}
        similarProperties={similarProperties as any}
        nearbyProperties={nearbyProperties as any}
        propertyTestimonials={propertyTestimonials as any}
        whatsappNumber={whatsappNumber}
        user={user}
      />
      <Footer />
    </div>
  )
}
