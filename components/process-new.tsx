'use client'

import React, { useEffect, useRef, useState } from 'react'

interface ProcessStep {
  id: number
  title: string
  description: string
}

interface ProcessProps {
  steps: ProcessStep[]
}

export default function Process({ steps }: ProcessProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
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
  }, [steps])

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-white">
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
            Process
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            A smooth and stress free journey
          </h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            We handle every detail with care and expertise from beginning to end.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className={`group relative p-8 bg-gray-50 rounded-3xl hover:bg-white hover:shadow-xl transition-all duration-700 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div
                className="text-5xl font-bold mb-4 transition-all duration-300 group-hover:scale-110"
                style={{ color: '#A8D5E2' }}
              >
                {String(step.id).padStart(2, '0')}
              </div>
              <h3 className="text-xl font-bold text-black mb-3">{step.title}</h3>
              <p className="text-gray-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
