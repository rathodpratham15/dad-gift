import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import BlogPageClient from './blog-page-client'

export const metadata: Metadata = { title: 'Blog - Real Estate Insights' }

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export default async function BlogPage({ searchParams }: PageProps) {
  const params = await searchParams

  const session = await auth()
  const user = session?.user
    ? { firstName: (session.user as any).firstName, role: (session.user as any).role }
    : null

  const page = parseInt(params.page || '1')
  const perPage = 9
  const category = params.category || null
  const search = params.search || null

  const where: Record<string, unknown> = { published: true }
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { excerpt: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [total, rawPosts, categoriesRaw] = await Promise.all([
    prisma.blogPost.count({ where }),
    prisma.blogPost.findMany({
      where,
      include: { author: true },
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.blogPost.findMany({
      where: { published: true, category: { not: null } },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    }),
  ])

  const posts = rawPosts.map((p) => ({
    ...p,
    tags: (p.tags as string[]) || [],
    publishedAt: p.publishedAt?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    author: p.author
      ? {
          ...p.author,
          specialties: (p.author.specialties as string[]) || [],
          socialLinks: p.author.socialLinks as Record<string, string> | null,
          createdAt: p.author.createdAt.toISOString(),
          updatedAt: p.author.updatedAt.toISOString(),
        }
      : null,
  }))

  const categories = categoriesRaw
    .map((c) => c.category)
    .filter((c): c is string => c !== null)

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <BlogPageClient
        posts={posts as any}
        categories={categories}
        meta={{
          currentPage: page,
          lastPage: Math.ceil(total / perPage),
          perPage,
          total,
        }}
        currentCategory={category}
        currentSearch={search}
      />
      <Footer />
    </div>
  )
}
