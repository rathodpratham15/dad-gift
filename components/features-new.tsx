'use client'

import React, { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Wrench, Zap, Droplet, Paintbrush, Flower, Home } from 'lucide-react'

interface Feature {
  id: number
  title: string
  description: string
  image?: string
}

interface FeaturesProps {
  features: Feature[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Flooring': Wrench,
  'Electrical Works': Zap,
  'Plumbing & Heating': Droplet,
  'Painting & Decorating': Paintbrush,
  'Landscaping': Flower,
  'Roofing': Home,
}

export default function Features({ features }: FeaturesProps) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-16 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
          >
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            A smooth and stress free journey
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            We handle every detail with care and expertise from beginning to end.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-4">
            {features.map((feature, index) => {
              const Icon = iconMap[feature.title]
              return (
                <div
                  key={feature.id}
                  className={`border border-gray-200 rounded-2xl overflow-hidden bg-white transition-all duration-700 hover:shadow-lg ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <button
                    onClick={() => setActiveFeature(index)}
                    className="w-full flex items-center justify-between p-6 text-left transition-colors duration-300"
                  >
                    <div className="flex items-center gap-4">
                      {Icon && <Icon className="h-6 w-6 text-black" />}
                      <h3 className="text-xl font-semibold text-black">{feature.title}</h3>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                        activeFeature === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 overflow-hidden ${
                      activeFeature === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="px-6 pb-6 text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="relative">
            <div className="sticky top-24">
              <div
                className={`relative overflow-hidden rounded-3xl aspect-[3/4] shadow-xl transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}
              >
                {features[activeFeature]?.image ? (
                  <img loading="lazy" decoding="async"
                    src={features[activeFeature].image}
                    alt={features[activeFeature].title}
                    className="w-full h-full object-cover transition-all duration-500"
                    key={activeFeature}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
