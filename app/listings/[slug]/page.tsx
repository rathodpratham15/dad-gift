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

  const similarPropertiesRaw = await prisma.property.findMany({
    where: {
      propertyType: rawProperty.propertyType,
      id: { not: rawProperty.id },
      status: 'for_sale',
    },
    take: 4,
  })

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
      <Navbar user={user} lightBg />
      <PropertyDetailClient
        property={property as any}
        similarProperties={similarProperties as any}
        propertyTestimonials={propertyTestimonials as any}
        whatsappNumber={whatsappNumber}
        user={user}
      />
      <Footer />
    </div>
  )
}
