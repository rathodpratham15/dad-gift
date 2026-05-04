'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { BlogPost } from '@/lib/types'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  const formatDate = (date: string | null) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="relative h-[240px] bg-slate-200 overflow-hidden">
          {post.featuredImage ? (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
              <motion.img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.1, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 uppercase font-medium tracking-wide">
            <span>{post.category || 'Article'}</span>
            <span>•</span>
            <span>7 min read</span>
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-slate-900 group-hover:text-slate-700 transition-colors line-clamp-2 leading-tight">
            {post.title}
          </h3>
          
          {post.author && (
            <div className="flex items-center gap-3 mt-4">
              {post.author.photo ? (
                <motion.img
                  src={post.author.photo}
                  alt={`${post.author.firstName} ${post.author.lastName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-semibold">
                    {post.author.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {post.author.firstName} {post.author.lastName}
                </p>
                <p className="text-xs text-slate-500">Senior Housing Economist</p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
