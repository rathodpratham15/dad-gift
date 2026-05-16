import { redirect } from 'next/navigation'
import { auth, isSuperAdminEmail } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import AdminHeader from '../admin-header'
import UsersClient from './users-client'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/admin/login')
  }
  if (!isSuperAdminEmail(session.user.email)) {
    redirect('/admin/properties')
  }

  const [users, newInquiriesCount] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { createdAt: 'desc' }],
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

        <UsersClient users={serializedUsers} currentEmail={currentEmail} />
      </div>
    </div>
  )
}
