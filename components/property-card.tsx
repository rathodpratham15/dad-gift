'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react'
import type { Property } from '@/lib/types'
import { formatPrice } from '@/lib/utils'

export default function PropertyCard({ property }: { property: Property }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      className="group"
    >
      <Link
        href={`/listings/${property.slug}`}
        className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
      >
        <div className="relative h-[260px] bg-slate-100 overflow-hidden">
          {property.mainImage ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10" />
              <motion.img
                src={property.mainImage}
                alt={property.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.07 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
              <div className="absolute top-3 left-3 z-20">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: property.status === 'rental' ? '#A8D5E2' : '#1a1a1a',
                    color: property.status === 'rental' ? '#1a1a1a' : '#ffffff',
                  }}
                >
                  {property.status === 'rental' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>

        <div className="p-5">
          <p className="text-2xl font-bold text-slate-900 mb-1">{formatPrice(property.price)}</p>
          <h3 className="text-base font-semibold text-slate-800 group-hover:text-slate-600 transition-colors line-clamp-1 mb-2">
            {property.title}
          </h3>
          {(property.city || property.address) && (
            <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{property.city || property.address}</span>
            </div>
          )}

          {(property.bedrooms || property.bathrooms || property.squareFeet) && (
            <div className="flex items-center gap-4 text-slate-500 text-sm pt-3 border-t border-slate-100">
              {property.bedrooms != null && (
                <span className="flex items-center gap-1">
                  <Bed className="h-3.5 w-3.5" />
                  {property.bedrooms} bed
                </span>
              )}
              {property.bathrooms != null && (
                <span className="flex items-center gap-1">
                  <Bath className="h-3.5 w-3.5" />
                  {property.bathrooms} bath
                </span>
              )}
              {property.squareFeet != null && (
                <span className="flex items-center gap-1">
                  <Maximize2 className="h-3.5 w-3.5" />
                  {property.squareFeet.toLocaleString()} sq.ft
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
