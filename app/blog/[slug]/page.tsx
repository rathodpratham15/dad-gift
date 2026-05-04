import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer-new'
import BlogPostClient from './blog-post-client'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true } })
  if (!post) return { title: 'Post Not Found' }
  return {
    title: post.title,
    description: post.excerpt || undefined,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params

  const session = await auth()
  const user = session?.user
    ? { firstName: (session.user as any).firstName, role: (session.user as any).role }
    : null

  const rawPost = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    include: { author: true },
  })

  if (!rawPost) {
    notFound()
  }

  const relatedRaw = await prisma.blogPost.findMany({
    where: {
      published: true,
      id: { not: rawPost.id },
      ...(rawPost.category ? { category: rawPost.category } : {}),
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  })

  const serializePost = (p: typeof rawPost) => ({
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
  })

  const post = serializePost(rawPost)

  const relatedPosts = relatedRaw.map((p) => ({
    ...p,
    tags: (p.tags as string[]) || [],
    publishedAt: p.publishedAt?.toISOString() || null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    author: null,
  }))

  return (
    <div className="min-h-screen bg-white">
      <Navbar user={user} />
      <BlogPostClient post={post as any} relatedPosts={relatedPosts as any} />
      <Footer />
    </div>
  )
}
