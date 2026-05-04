import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import AdminHeader from '../admin-header'
import { formatPrice } from '@/lib/utils'
import DeletePropertyButton from './delete-button'
import { Eye, Pencil, Star, Plus } from 'lucide-react'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function AdminPropertiesPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const perPage = 15

  const [total, properties, newInquiriesCount] = await Promise.all([
    prisma.property.count(),
    prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
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
            <h1 className="text-2xl font-bold text-black">Properties</h1>
            <p className="text-gray-600 text-sm mt-1">{total} total properties</p>
          </div>
          <Link
            href="/admin/properties/create"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-900 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Property
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Property
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Location
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Status
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Rating
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-4">
                    Flags
                  </th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {property.mainImage ? (
                          <img
                            src={property.mainImage}
                            alt={property.title}
                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-200 flex-shrink-0" />
                        )}
                        <div>
                          <p className="font-medium text-black text-sm line-clamp-1">
                            {property.title}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {property.propertyType}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-700">
                        {property.city}, {property.state}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-black">
                        {formatPrice(property.price)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          property.status === 'for_sale'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {property.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {property.rating ? (
                        <span className="flex items-center gap-1 text-sm text-amber-600">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {property.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        {property.featured && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs">
                            Featured
                          </span>
                        )}
                        {property.isPopular && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs">
                            Popular
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/listings/${property.slug}`}
                          target="_blank"
                          className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/admin/properties/${property.id}/edit`}
                          className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-gray-100 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <DeletePropertyButton id={property.id} title={property.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {properties.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>No properties yet.</p>
              <Link href="/admin/properties/create" className="mt-2 inline-block text-black underline text-sm">
                Create your first property
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
                href={`/admin/properties?page=${p}`}
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
