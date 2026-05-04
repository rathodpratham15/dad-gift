import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import DashboardClient from './dashboard-client'

export const metadata: Metadata = { title: 'My Dashboard' }

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }
  if ((session.user as any).role === 'admin') {
    redirect('/admin/properties')
  }

  const userId = parseInt(session.user.id)
  const userInfo = {
    firstName: (session.user as any).firstName as string,
    role: (session.user as any).role as string,
  }

  const [userWithFavorites, contacts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        favoriteProperties: {
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const favorites = (userWithFavorites?.favoriteProperties || []).map((p) => ({
    ...p,
    images: (p.images as string[]) || [],
    videos: (p.videos as string[]) || [],
    features: p.features as Record<string, unknown> | null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))

  const inquiries = contacts.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))

  const user = {
    firstName: userInfo.firstName,
    lastName: (session.user as any).lastName as string || '',
    email: session.user.email || '',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={userInfo} />
      <DashboardClient
        user={user}
        favorites={favorites as any}
        inquiries={inquiries as any}
      />
      <Footer />
    </div>
  )
}
