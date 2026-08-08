import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth, isSuperAdminEmail } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import ProfileClient from './profile-client'

export const metadata: Metadata = { title: 'My Profile' }

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser) {
    redirect('/login')
  }

  const isSuperAdmin = isSuperAdminEmail(dbUser.email)

  const [ownPendingRequest, admins, pendingRequests] = await Promise.all([
    prisma.adminAccessRequest.findFirst({
      where: { userId, status: 'pending' },
    }),
    isSuperAdmin
      ? prisma.user.findMany({
          where: { role: 'admin' },
          orderBy: { firstName: 'asc' },
          select: { id: true, email: true, firstName: true, lastName: true },
        })
      : Promise.resolve([]),
    isSuperAdmin
      ? prisma.adminAccessRequest.findMany({
          where: { status: 'pending' },
          orderBy: { createdAt: 'asc' },
          include: {
            user: { select: { id: true, email: true, firstName: true, lastName: true } },
          },
        })
      : Promise.resolve([]),
  ])

  const user = {
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    email: dbUser.email,
    role: dbUser.role,
  }

  const serializedPendingRequests = pendingRequests.map((r) => ({
    id: r.id,
    createdAt: r.createdAt.toISOString(),
    user: r.user,
  }))

  const navUser = { firstName: dbUser.firstName, role: dbUser.role }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={navUser} solid />
      <ProfileClient
        user={user}
        hasPendingRequest={!!ownPendingRequest}
        isSuperAdmin={isSuperAdmin}
        admins={admins}
        pendingRequests={serializedPendingRequests}
      />
      <Footer />
    </div>
  )
}
