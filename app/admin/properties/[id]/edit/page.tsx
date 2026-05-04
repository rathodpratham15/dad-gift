import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../../../admin-header'
import PropertyForm from '../../property-form'
import { updatePropertyAction } from '@/app/actions/property'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPropertyPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const { id } = await params
  const propertyId = parseInt(id)

  if (isNaN(propertyId)) notFound()

  const [rawProperty, newInquiriesCount] = await Promise.all([
    prisma.property.findUnique({ where: { id: propertyId } }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  if (!rawProperty) notFound()

  const property = {
    ...rawProperty,
    images: (rawProperty.images as string[]) || [],
    videos: (rawProperty.videos as string[]) || [],
    features: rawProperty.features as Record<string, unknown> | null,
    createdAt: rawProperty.createdAt.toISOString(),
    updatedAt: rawProperty.updatedAt.toISOString(),
  }

  const boundUpdateAction = updatePropertyAction.bind(null, propertyId)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Edit Property</h1>
          <p className="text-gray-600 text-sm mt-1">{property.title}</p>
        </div>

        <PropertyForm property={property as any} action={boundUpdateAction} isEdit />
      </div>
    </div>
  )
}
