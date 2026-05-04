'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { Property } from '@/lib/types'
import { Bed, Bath, Maximize, ArrowRight, Star } from 'lucide-react'
import { Button } from './ui/button'

interface ListingsProps {
  properties: Property[]
}

export default function Listings({ properties }: ListingsProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([])

  useEffect(() => {
    const observers = cardRefs.current.map((ref, index) => {
      if (!ref) return null
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisibleCards((prev) => Array.from(new Set([...prev, index])))
            }
          })
        },
        { threshold: 0.1 }
      )
      if (ref) observer.observe(ref)
      return observer
    })

    return () => {
      observers.forEach((observer) => observer?.disconnect())
    }
  }, [properties])

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
            >
              Listings
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-black">
              Find homes that perfectly<br />match your lifestyle
            </h2>
          </div>
          <Link href="/listings">
            <Button className="bg-black text-white hover:bg-black/90 rounded-full px-6 py-3 hidden md:flex items-center">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property, index) => (
            <Link
              href={`/listings/${property.slug}`}
              key={property.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className={`group cursor-pointer transition-all duration-700 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="relative overflow-hidden rounded-3xl mb-4 aspect-[4/3]">
                {property.mainImage ? (
                  <img loading="lazy" decoding="async"
                    src={property.mainImage}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {property.isPopular && (
                  <div className="absolute top-4 left-4 bg-rose-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Popular
                  </div>
                )}
              </div>
              <div className="px-2">
                <h3 className="text-xl font-semibold text-black mb-2 capitalize">{property.title}</h3>
                {property.overallRating && (
                  <p className="text-sm font-medium text-amber-600 mb-1 inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    {property.overallRating.toFixed(1)} / 5
                    {property.ratingCount ? ` (${property.ratingCount})` : ''}
                  </p>
                )}
                <p className="text-2xl font-bold text-black mb-3">
                  ₹{Math.floor(property.price).toLocaleString('en-IN')}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {property.bedrooms && (
                    <div className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      <span>{property.bedrooms}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      <span>{property.bathrooms}</span>
                    </div>
                  )}
                  {property.squareFeet && (
                    <div className="flex items-center gap-1">
                      <Maximize className="h-4 w-4" />
                      <span>{property.squareFeet.toLocaleString('en-US')} sq.ft</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
