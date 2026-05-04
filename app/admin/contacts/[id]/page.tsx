import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../../admin-header'
import ContactActions from './contact-actions'
import { ArrowLeft, Mail, Phone, Calendar, User } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminContactDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const { id } = await params
  const contactId = parseInt(id)
  if (isNaN(contactId)) notFound()

  const [rawContact, newInquiriesCount] = await Promise.all([
    prisma.contact.findUnique({ where: { id: contactId } }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  if (!rawContact) notFound()

  // Mark as read if new
  if (rawContact.status === 'new') {
    await prisma.contact.update({
      where: { id: contactId },
      data: { status: 'read' },
    })
  }

  const contact = {
    ...rawContact,
    createdAt: rawContact.createdAt.toISOString(),
    updatedAt: rawContact.updatedAt.toISOString(),
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={rawContact.status === 'new' ? newInquiriesCount - 1 : newInquiriesCount} />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link
          href="/admin/contacts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Contacts
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h1 className="text-xl font-bold text-black mb-4">
                {contact.subject || 'No Subject'}
              </h1>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{contact.message}</p>
            </div>

            {contact.adminResponse && (
              <div className="bg-blue-50 rounded-2xl p-6">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                  Admin Response
                </p>
                <p className="text-gray-700 leading-relaxed">{contact.adminResponse}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Sender Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-black mb-4">Contact Details</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <p className="text-sm font-medium text-black">{contact.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {contact.email}
                  </a>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-600">
                    {new Date(contact.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <a
                  href={`mailto:${contact.email}?subject=Re: ${encodeURIComponent(contact.subject || 'Your Inquiry')}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="font-semibold text-black mb-4">Update Status</h2>
              <ContactActions contact={contact as any} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
