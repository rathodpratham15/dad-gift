'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { BlogPost } from '@/lib/types'
import { Clock, ArrowRight, Search } from 'lucide-react'

interface BlogPageClientProps {
  posts: BlogPost[]
  categories: string[]
  meta: {
    currentPage: number
    lastPage: number
    perPage: number
    total: number
  }
  currentCategory: string | null
  currentSearch: string | null
}

export default function BlogPageClient({
  posts,
  categories,
  meta,
  currentCategory,
  currentSearch,
}: BlogPageClientProps) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const sp = new URLSearchParams()
    if (search) sp.set('search', search)
    if (currentCategory) sp.set('category', currentCategory)
    router.push(`/blog?${sp.toString()}`)
  }

  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="pt-32 pb-16 px-6"
        style={{ background: 'linear-gradient(135deg, #A8D5E2 0%, #e8f4f8 50%, #ffffff 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#1a1a1a' }}
          >
            Blog
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-4">
            Real Estate Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Expert advice, market trends, and tips for buyers, sellers, and investors.
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl font-medium text-white text-sm"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Category filters */}
      {categories.length > 0 && (
        <section className="py-6 px-6 border-b border-gray-100">
          <div className="max-w-7xl mx-auto flex gap-3 flex-wrap">
            <Link
              href="/blog"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !currentCategory
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  currentCategory === cat
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Posts */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <p className="text-xl">No articles found.</p>
              <Link href="/blog" className="mt-4 inline-block text-black underline">
                View all articles
              </Link>
            </div>
          ) : (
            <>
              {/* Featured post */}
              {featuredPost && (
                <Link
                  href={`/blog/${featuredPost.slug}`}
                  className="group block mb-12 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="aspect-[4/3] md:aspect-auto bg-gray-200 overflow-hidden">
                      {featuredPost.featuredImage ? (
                        <img
                          src={featuredPost.featuredImage}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center min-h-[300px]">
                          <span className="text-slate-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center bg-white">
                      {featuredPost.category && (
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 w-fit"
                          style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
                        >
                          {featuredPost.category}
                        </span>
                      )}
                      <h2 className="text-2xl md:text-3xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {featuredPost.publishedAt
                            ? new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </span>
                        {featuredPost.author && (
                          <span>
                            {featuredPost.author.firstName} {featuredPost.author.lastName}
                          </span>
                        )}
                      </div>
                      <div className="mt-6 flex items-center gap-2 font-medium text-black group-hover:gap-3 transition-all">
                        Read Article <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              )}

              {/* Grid of other posts */}
              {otherPosts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherPosts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/blog/${post.slug}`}
                      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col"
                    >
                      <div className="aspect-[16/9] bg-gray-200 overflow-hidden">
                        {post.featuredImage ? (
                          <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                            <span className="text-slate-400 text-sm">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        {post.category && (
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 w-fit"
                            style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
                          >
                            {post.category}
                          </span>
                        )}
                        <h3 className="font-bold text-lg text-black mb-3 group-hover:text-gray-700 transition-colors line-clamp-2 flex-1">
                          {post.title}
                        </h3>
                        {post.excerpt && (
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-auto">
                          <Clock className="h-3 w-3" />
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : 'Recent'}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {meta.lastPage > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              {Array.from({ length: meta.lastPage }, (_, i) => i + 1).map((p) => {
                const sp = new URLSearchParams()
                sp.set('page', String(p))
                if (currentCategory) sp.set('category', currentCategory)
                if (currentSearch) sp.set('search', currentSearch)
                return (
                  <Link
                    key={p}
                    href={`/blog?${sp.toString()}`}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-medium transition-colors ${
                      p === meta.currentPage
                        ? 'bg-black text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
