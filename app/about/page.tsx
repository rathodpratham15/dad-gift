import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import AboutClient from './about-client'

export const metadata: Metadata = { title: 'About Us' }

export default async function AboutPage() {
  const session = await auth()
  const user = session?.user
    ? { firstName: (session.user as any).firstName, role: (session.user as any).role }
    : null

  const [agentsRaw, propertiesSoldCount, testimonialsRaw, agentsForExp] = await Promise.all([
    prisma.agent.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.property.count({ where: { status: 'for_sale' } }),
    prisma.testimonial.findMany({ select: { rating: true } }),
    prisma.agent.findMany({ where: { isActive: true }, select: { yearsOfExperience: true } }),
  ])

  const totalRated = testimonialsRaw.filter((t) => t.rating !== null).length
  const satisfiedRated = testimonialsRaw.filter((t) => t.rating !== null && t.rating >= 4).length
  const satisfactionRate =
    totalRated > 0 ? Math.round((satisfiedRated / totalRated) * 100) : 98

  const maxYears =
    agentsForExp.reduce((max, a) => Math.max(max, a.yearsOfExperience ?? 0), 0) || 10

  const agents = agentsRaw.map((a) => ({
    ...a,
    specialties: (a.specialties as string[]) || [],
    socialLinks: a.socialLinks as Record<string, string> | null,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  }))

  const stats = {
    happyClients: totalRated + 50,
    propertiesSold: propertiesSoldCount,
    yearsExperience: maxYears,
    satisfactionRate,
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <AboutClient agents={agents as any} stats={stats} />
      <Footer />
    </div>
  )
}
