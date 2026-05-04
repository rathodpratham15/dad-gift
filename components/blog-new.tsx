'use client'

import React from 'react'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'
import { ArrowRight, Clock } from 'lucide-react'
import { Button } from './ui/button'

interface BlogProps {
  posts: BlogPost[]
}

export default function Blog({ posts }: BlogProps) {
  const featuredPost = posts[0]
  const otherPosts = posts.slice(1)

  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
            >
              Blog
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              Explore our latest blogs for<br />real estate insights
            </h2>
          </div>
          <Link href="/blog">
            <Button className="bg-black text-white hover:bg-black/90 rounded-full px-6 py-3 hidden md:flex items-center">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredPost && (
            <Link
              href={`/blog/${featuredPost.slug}`}
              className="md:col-span-1 group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-3xl mb-4 aspect-[3/2]">
                {featuredPost.featuredImage ? (
                  <img loading="lazy" decoding="async"
                    src={featuredPost.featuredImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="px-2">
                <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>7 min read</span>
                </div>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3"
                  style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
                >
                  {featuredPost.category || 'Article'}
                </span>
                <h3 className="text-2xl font-bold text-black mb-4 group-hover:text-gray-700 transition-colors">
                  {featuredPost.title}
                </h3>
                {featuredPost.author && (
                  <div className="flex items-center gap-3">
                    {featuredPost.author.photo ? (
                      <img loading="lazy" decoding="async"
                        src={featuredPost.author.photo}
                        alt={`${featuredPost.author.firstName} ${featuredPost.author.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          {featuredPost.author.firstName?.charAt(0) || 'A'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-black text-sm">
                        {featuredPost.author.firstName} {featuredPost.author.lastName}
                      </p>
                      <p className="text-xs text-gray-600">Senior Housing Economist</p>
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 gap-6">
            {otherPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group cursor-pointer flex gap-4"
              >
                <div className="relative overflow-hidden rounded-2xl w-32 h-32 flex-shrink-0">
                  {post.featuredImage ? (
                    <img loading="lazy" decoding="async"
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <span className="text-xs text-slate-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-2"
                    style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
                  >
                    {post.category || 'Article'}
                  </span>
                  <p className="text-sm text-gray-600">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      : 'Recent'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
