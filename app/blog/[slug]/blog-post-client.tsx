'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'
import { ArrowLeft, Clock, User, Tag } from 'lucide-react'

interface BlogPostClientProps {
  post: BlogPost
  relatedPosts: BlogPost[]
}

export default function BlogPostClient({ post, relatedPosts }: BlogPostClientProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setTimeout(() => setIsVisible(true), 100)
  }, [post.id])

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent'

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="pt-24 pb-0">
        {post.featuredImage && (
          <div className="w-full h-[400px] md:h-[500px] overflow-hidden relative">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
        )}
      </section>

      {/* Article */}
      <article className="py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </Link>

            {post.category && (
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
              >
                {post.category}
              </span>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-black mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {formattedDate}
              </span>
              {post.author && (
                <span className="flex items-center gap-2">
                  {post.author.photo ? (
                    <img
                      src={post.author.photo}
                      alt={`${post.author.firstName} ${post.author.lastName}`}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                  )}
                  {post.author.firstName} {post.author.lastName}
                </span>
              )}
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-8 font-medium">
                {post.excerpt}
              </p>
            )}

            {/* Content */}
            <div
              className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap' }}
            >
              {post.content}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex items-center gap-3 flex-wrap">
                  <Tag className="h-4 w-4 text-gray-500" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {related.featuredImage && (
                    <div className="aspect-[16/9] overflow-hidden">
                      <img
                        src={related.featuredImage}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    {related.category && (
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                        style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
                      >
                        {related.category}
                      </span>
                    )}
                    <h3 className="font-bold text-black group-hover:text-gray-700 transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">
                      {related.publishedAt
                        ? new Date(related.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
