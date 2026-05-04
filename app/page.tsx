import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import Listings from '@/components/listings-new'
import Testimonials from '@/components/testimonials-new'
import Process from '@/components/process-new'
import FAQs from '@/components/faqs-new'
import Footer from '@/components/footer-new'

export const metadata: Metadata = {
  title: 'Discover the perfect place to call home',
}

const processSteps = [
  { id: 1, title: 'Initial Consultation', description: 'We begin by understanding your goals, needs, and preferences to tailor our approach to your specific real estate journey.' },
  { id: 2, title: 'Market analysis & strategy', description: 'We provide a comprehensive market analysis to help you understand current trends or make informed purchase decisions.' },
  { id: 3, title: 'Property Search or Listing', description: 'We assist in finding the perfect property, utilizing our expertise to guide you through the options or marketing strategies.' },
  { id: 4, title: 'Negotiation and Closing', description: 'Our team handles negotiations, ensuring the best deal, and supports you through the paperwork for a seamless closing process.' },
]

const faqsData = [
  { id: 1, question: 'What services does your agency provide?', answer: 'Our agency offers a wide range of services, including buying, selling, and renting residential and commercial properties. We provide comprehensive market analysis, property staging, professional photography, and expert negotiation to ensure the best outcomes for our clients.' },
  { id: 2, question: 'How do you determine the value of a property?', answer: 'We use a combination of comparative market analysis, recent sales data, property condition assessment, and current market trends to accurately determine property values.' },
  { id: 3, question: 'What are the fees for your services?', answer: 'Our fee structure is transparent and competitive. Typically, we charge a commission based on the final sale price. We offer different packages tailored to your needs and will discuss all costs upfront before you commit.' },
  { id: 4, question: 'How long does it typically take to sell a property?', answer: 'The time to sell varies depending on market conditions, property location, pricing, and condition. On average, properties sell within 30-90 days.' },
  { id: 5, question: 'What areas do you specialize in?', answer: 'We specialize in luxury residential properties, waterfront estates, modern contemporary homes, and commercial real estate across the region.' },
]

export default async function HomePage() {
  const session = await auth()
  const user = session?.user ? { firstName: (session.user as any).firstName, role: (session.user as any).role } : null

  const [featuredPropertiesRaw, testimonials, recentBlogPosts] = await Promise.all([
    prisma.property.findMany({
      where: { featured: true, status: 'for_sale' },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
    prisma.testimonial.findMany({
      include: { property: { select: { id: true, title: true, slug: true } } },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 30,
    }),
    prisma.blogPost.findMany({
      where: { published: true },
      include: { author: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    }),
  ])

  const featuredProperties = featuredPropertiesRaw.map((p) => ({
    ...p,
    images: (p.images as string[]) || [],
    features: p.features as Record<string, unknown> | null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  const serializedTestimonials = testimonials.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    property: t.property,
  }))

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} />
      <main className="flex-1">
        <Hero />
        <Listings properties={featuredProperties as any} />
        <Testimonials testimonials={serializedTestimonials as any} />
        <Process steps={processSteps} />
        <FAQs faqs={faqsData} />
      </main>
      <Footer />
    </div>
  )
}
