import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../../../admin-header'
import TestimonialAdminForm from '../../testimonial-form'
import { updateTestimonialAction } from '@/app/actions/testimonial'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTestimonialPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const { id } = await params
  const testimonialId = parseInt(id)
  if (isNaN(testimonialId)) notFound()

  const [rawTestimonial, propertiesRaw, newInquiriesCount] = await Promise.all([
    prisma.testimonial.findUnique({
      where: { id: testimonialId },
      include: { property: { select: { id: true, title: true, slug: true } } },
    }),
    prisma.property.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
      take: 300,
    }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  if (!rawTestimonial) notFound()

  const testimonial = {
    ...rawTestimonial,
    createdAt: rawTestimonial.createdAt.toISOString(),
    updatedAt: rawTestimonial.updatedAt.toISOString(),
    property: rawTestimonial.property || null,
  }

  const boundUpdateAction = updateTestimonialAction.bind(null, testimonialId)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Edit Testimonial</h1>
          <p className="text-gray-600 text-sm mt-1">By {testimonial.clientName}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <TestimonialAdminForm
            testimonial={testimonial as any}
            properties={propertiesRaw}
            action={boundUpdateAction}
            isEdit
          />
        </div>
      </div>
    </div>
  )
}
