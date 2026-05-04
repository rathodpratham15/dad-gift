import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import TestimonialForm from './testimonial-form'
import { Star } from 'lucide-react'

export const metadata: Metadata = { title: 'Share Your Testimonial' }

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function ShareTestimonialPage({ searchParams }: PageProps) {
  const params = await searchParams

  const session = await auth()
  const user = session?.user
    ? { firstName: (session.user as any).firstName, role: (session.user as any).role }
    : null

  const propertiesRaw = await prisma.property.findMany({
    select: { id: true, title: true, slug: true },
    orderBy: { title: 'asc' },
    take: 300,
  })

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />

      <section
        className="pt-32 pb-16 px-6"
        style={{ background: 'linear-gradient(135deg, #A8D5E2 0%, #e8f4f8 50%, #ffffff 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-8 w-8 text-amber-400 fill-current" />
            ))}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">Share Your Experience</h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto">
            Your feedback helps others make confident real estate decisions. Tell us about your
            experience with us.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Your Testimonial</h2>
            <TestimonialForm
              properties={propertiesRaw}
              selectedPropertyId={params.propertyId || null}
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
