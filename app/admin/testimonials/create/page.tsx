import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../../admin-header'
import TestimonialAdminForm from '../testimonial-form'
import { createTestimonialAction } from '@/app/actions/testimonial'

export default async function CreateTestimonialPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const [propertiesRaw, newInquiriesCount] = await Promise.all([
    prisma.property.findMany({
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
      take: 300,
    }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} />

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Create Testimonial</h1>
          <p className="text-gray-600 text-sm mt-1">Add a new client testimonial</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <TestimonialAdminForm
            properties={propertiesRaw}
            action={createTestimonialAction}
          />
        </div>
      </div>
    </div>
  )
}
