import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import AdminHeader from '../../admin-header'
import PropertyForm from '../property-form'
import { createPropertyAction } from '@/app/actions/property'
import { prisma } from '@/lib/prisma'

export default async function CreatePropertyPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const newInquiriesCount = await prisma.contact.count({ where: { status: 'new' } })

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Create Property</h1>
          <p className="text-gray-600 text-sm mt-1">Add a new property listing</p>
        </div>

        <PropertyForm action={createPropertyAction} />
      </div>
    </div>
  )
}
