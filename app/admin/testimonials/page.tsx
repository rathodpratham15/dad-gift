import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../admin-header'
import DeleteTestimonialButton from './delete-testimonial-button'
import { Pencil, Star, Plus } from 'lucide-react'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function AdminTestimonialsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const perPage = 20

  const [total, testimonials, newInquiriesCount] = await Promise.all([
    prisma.testimonial.count(),
    prisma.testimonial.findMany({
      include: { property: { select: { id: true, title: true, slug: true } } },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  const lastPage = Math.ceil(total / perPage)

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Testimonials</h1>
            <p className="text-gray-600 text-sm mt-1">{total} total testimonials</p>
          </div>
          <Link
            href="/admin/testimonials/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Testimonial
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Client
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Property
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Rating
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Featured
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Order
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {testimonials.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {t.clientPhoto ? (
                          <img
                            src={t.clientPhoto}
                            alt={t.clientName}
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-500">
                              {t.clientName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-black text-sm">{t.clientName}</p>
                          <p className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">
                            {t.content}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {t.property ? (
                        <Link
                          href={`/listings/${t.property.slug}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline line-clamp-1"
                        >
                          {t.property.title}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-400">General</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {t.rating !== null ? (
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {t.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          t.featured ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {t.featured ? 'Featured' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{t.order}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/testimonials/${t.id}/edit`}
                          className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeleteTestimonialButton id={t.id} clientName={t.clientName} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {testimonials.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>No testimonials yet.</p>
              <Link
                href="/admin/testimonials/create"
                className="mt-2 inline-block text-black underline text-sm"
              >
                Create the first one
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {lastPage > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/testimonials?page=${p}`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                  p === page ? 'bg-black text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
