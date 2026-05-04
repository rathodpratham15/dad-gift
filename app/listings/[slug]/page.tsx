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
  return { title: property.title }
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
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
