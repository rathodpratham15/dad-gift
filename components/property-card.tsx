'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Property } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export default function PropertyCard({ property }: { property: Property }) {
  const formatSquareFeet = (sqft: number | null) => {
    if (!sqft) return ''
    return `${sqft.toLocaleString('en-US')} sq.ft`
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
        href={`/listings/${property.slug}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="relative h-[280px] bg-slate-200 overflow-hidden">
          {property.mainImage ? (
            <>
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
              <motion.img
                src={property.mainImage}
                alt={property.title}
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
          <h3 className="text-lg font-semibold mb-2 text-slate-900 group-hover:text-slate-700 transition-colors">
            {property.title}
          </h3>
          <p className="text-2xl font-bold text-slate-900 mb-4">{formatPrice(property.price)}</p>
          {property.squareFeet && (
            <p className="text-slate-600 text-sm font-medium">{formatSquareFeet(property.squareFeet)}</p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
