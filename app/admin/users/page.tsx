import { redirect } from 'next/navigation'
import { auth, isSuperAdminEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminHeader from '../admin-header'
import AdminPagination from '../pagination'
import UsersClient from './users-client'

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }
  if (!isSuperAdminEmail(session.user.email)) {
    redirect('/admin/properties')
  }

  const params = await searchParams
  const page = parseInt(params.page || '1')
  const search = params.search?.trim() || ''
  const perPage = 10

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [total, users, newInquiriesCount] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        googleId: true,
      },
    }),
    prisma.contact.count({ where: { status: 'new' } }),
  ])

  const lastPage = Math.max(1, Math.ceil(total / perPage))

  const serializedUsers = users.map((u) => ({
    ...u,
    createdAt: u.createdAt.toISOString(),
  }))

  const currentEmail = session.user.email ?? ''

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader newInquiriesCount={newInquiriesCount} isSuperAdmin />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-black">Users</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage admin access. Only you ({currentEmail}) can see this page.
          </p>
        </div>

        <UsersClient users={serializedUsers} currentEmail={currentEmail} search={search} />

        <AdminPagination
          page={page}
          lastPage={lastPage}
          basePath="/admin/users"
          extraParams={search ? { search } : {}}
        />
      </div>
    </div>
  )
}
