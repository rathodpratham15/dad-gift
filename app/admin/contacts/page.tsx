import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../admin-header'
import { Mail, Phone, Calendar } from 'lucide-react'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  read: 'bg-gray-100 text-gray-600',
  replied: 'bg-green-50 text-green-700',
  archived: 'bg-amber-50 text-amber-700',
}

export default async function AdminContactsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const perPage = 20
  const statusFilter = params.status || null

  const where = statusFilter ? { status: statusFilter } : {}

  const [total, contacts, counts, newInquiriesCount] = await Promise.all([
    prisma.contact.count({ where }),
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contact.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  const statusCounts = counts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = c._count.status
    return acc
  }, {})

  const lastPage = Math.ceil(total / perPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Contacts / Inquiries</h1>
            <p className="text-gray-600 text-sm mt-1">{total} total messages</p>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Link
            href="/admin/contacts"
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              !statusFilter ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({Object.values(statusCounts).reduce((a, b) => a + b, 0)})
          </Link>
          {(['new', 'read', 'replied', 'archived'] as const).map((s) => (
            <Link
              key={s}
              href={`/admin/contacts?status=${s}`}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {s} ({statusCounts[s] || 0})
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Contact
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Subject
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Date
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      contact.status === 'new' ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-black text-sm">{contact.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Mail className="h-3 w-3" />
                        {contact.email}
                      </div>
                      {contact.phone && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                          <Phone className="h-3 w-3" />
                          {contact.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700 line-clamp-1">
                        {contact.subject || 'No subject'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          STATUS_COLORS[contact.status] || 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(contact.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/contacts/${contact.id}`}
                        className="inline-flex px-4 py-1.5 rounded-lg bg-black text-white text-xs font-medium hover:bg-gray-900 transition-colors"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {contacts.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>No contacts found.</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => {
              const sp = new URLSearchParams()
              sp.set('page', String(p))
              if (statusFilter) sp.set('status', statusFilter)
              return (
                <Link
                  key={p}
                  href={`/admin/contacts?${sp.toString()}`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                    p === page ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
