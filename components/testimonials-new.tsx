'use client'

import React, { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import type { Testimonial } from '@/lib/types'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pointerStartX = useRef(0)
  const scrollStartLeft = useRef(0)
  const isDragging = useRef(false)
  const wheelTimeout = useRef<number | null>(null)
  const speedRef = useRef(0.25)
  const [isPaused, setIsPaused] = useState(false)
  const [manualPause, setManualPause] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const shouldUseMarquee = testimonials.length >= 3

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
    if (testimonials.length === 0 || !shouldUseMarquee) return

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationFrameId: number
    let scrollPosition = scrollContainer.scrollLeft

    const scroll = () => {
      if (!isPaused && !isDragging.current) {
        scrollPosition += speedRef.current
        if (scrollPosition >= scrollContainer.scrollWidth / 2) {
          scrollPosition = 0
        }
        scrollContainer.scrollLeft = scrollPosition
      } else {
        scrollPosition = scrollContainer.scrollLeft
      }
      animationFrameId = requestAnimationFrame(scroll)
    }

    animationFrameId = requestAnimationFrame(scroll)

    return () => cancelAnimationFrame(animationFrameId)
  }, [isPaused, testimonials.length, shouldUseMarquee])

  useEffect(() => {
    return () => {
      if (wheelTimeout.current) {
        window.clearTimeout(wheelTimeout.current)
      }
    }
  }, [])

  const renderedTestimonials =
    testimonials.length === 0 ? [] : shouldUseMarquee ? [...testimonials, ...testimonials, ...testimonials] : testimonials

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current
    if (!container) return

    isDragging.current = true
    pointerStartX.current = event.clientX
    scrollStartLeft.current = container.scrollLeft
    setIsPaused(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = scrollRef.current
    if (!container || !isDragging.current) return

    const delta = event.clientX - pointerStartX.current
    container.scrollLeft = scrollStartLeft.current - delta
  }

  const handlePointerUp = () => {
    isDragging.current = false
    if (!manualPause) {
      setIsPaused(false)
    }
  }

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const container = scrollRef.current
    if (!container) return

    event.preventDefault()
    setIsPaused(true)
    container.scrollLeft += event.deltaY + event.deltaX

    if (wheelTimeout.current) {
      window.clearTimeout(wheelTimeout.current)
    }

    wheelTimeout.current = window.setTimeout(() => {
      if (!manualPause) {
        setIsPaused(false)
      }
    }, 1000)
  }

  return (
    <section ref={sectionRef} className="py-24 px-6 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto mb-12">
        <div
          className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span
            className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
            style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
          >
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-black">
            In our clients' words, real estate done right
          </h2>
          <p className="text-lg text-gray-600 mt-4">
            What our clients say about the quality, service, and results we deliver.
          </p>

          {testimonials.length > 0 && shouldUseMarquee && (
            <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={() => {
                  const next = !manualPause
                  setManualPause(next)
                  setIsPaused(next)
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm text-gray-700 hover:text-black hover:border-gray-300 transition-colors"
              >
                {manualPause ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                {manualPause ? 'Resume Auto Scroll' : 'Pause Auto Scroll'}
              </button>
              <p className="text-xs text-gray-500">Drag, scroll, or hold cards to read comfortably.</p>
            </div>
          )}
        </div>
      </div>

      {testimonials.length === 0 ? (
        <div className="max-w-3xl mx-auto text-center bg-gray-50 rounded-3xl p-10">
          <p className="text-gray-700 mb-4">No testimonials yet. Be the first to share your experience.</p>
          <Link
            href="/testimonials/share"
            className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium"
            style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
          >
            Share Your Testimonial
          </Link>
        </div>
      ) : (
        <div
          ref={scrollRef}
          className={`flex gap-6 select-none ${
            shouldUseMarquee
              ? 'overflow-x-hidden cursor-grab active:cursor-grabbing'
              : 'overflow-x-auto md:justify-center'
          }`}
          onMouseEnter={() => shouldUseMarquee && setIsPaused(true)}
          onMouseLeave={() => {
            if (shouldUseMarquee && !manualPause && !isDragging.current) {
              setIsPaused(false)
            }
          }}
          onPointerDown={(e) => shouldUseMarquee && handlePointerDown(e)}
          onPointerMove={(e) => shouldUseMarquee && handlePointerMove(e)}
          onPointerUp={() => shouldUseMarquee && handlePointerUp()}
          onPointerLeave={() => shouldUseMarquee && handlePointerUp()}
          onWheel={(e) => shouldUseMarquee && handleWheel(e)}
        >
          {renderedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="flex-shrink-0 w-80 bg-gray-50 rounded-3xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              <p className="text-gray-700 text-lg mb-6 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
              <div className="flex items-center gap-4">
                {testimonial.clientPhoto ? (
                  <img loading="lazy" decoding="async"
                    src={testimonial.clientPhoto}
                    alt={testimonial.clientName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {testimonial.clientName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-black">{testimonial.clientName}</p>
                  {testimonial.property && (
                    <Link
                      href={`/listings/${testimonial.property.slug}`}
                      className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      Property: {testimonial.property.title}
                    </Link>
                  )}
                  {!testimonial.property && (
                    <p className="text-xs text-gray-400">General testimonial</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
