'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from './ui/button'

export default function Hero({ propertyCount }: { propertyCount?: number }) {
  const displayCount = propertyCount !== undefined ? `${propertyCount}+` : '200+'
  const stats = [
    { value: displayCount, label: 'Properties Listed' },
    { value: '150+', label: 'Happy Clients' },
    { value: '10+', label: 'Years Experience' },
    { value: '98%', label: 'Satisfaction Rate' },
  ]
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #A8D5E2 0%, #B8E0ED 100%)' }}
    >
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-20 pb-16 sm:pb-32">
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Discover the perfect place to call home
        </h1>
        <p
          className={`text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto transition-all duration-1000 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          Your trusted real estate agency for luxury homes, offering exquisite properties.
        </p>
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <Link href="/listings">
            <Button className="bg-white text-black hover:bg-white/90 px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              Browse Listings
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/contact">
            <Button className="bg-transparent text-white border-2 border-white/60 hover:bg-white/10 px-8 py-6 text-base rounded-full transition-all duration-300 hover:scale-105">
              Work with us
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div
          className={`mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white/70 backdrop-blur-md rounded-2xl px-4 py-4">
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-2/3 transition-all duration-1200 delay-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
        }`}
      >
        <div className="relative w-full h-full flex items-end justify-center">
          <div className="absolute bottom-10 w-[86%] max-w-4xl h-[72%] rounded-[64px] bg-white/14 blur-[2px] pointer-events-none hidden sm:block" />
          <div className="absolute bottom-0 w-[84%] max-w-4xl h-20 rounded-full bg-black/20 blur-2xl pointer-events-none hidden sm:block" />
          <img
            src="https://framerusercontent.com/images/0xRyovYW1MyJtHWWrMvJemqp6E.png?width=2666&height=1325"
            alt="Modern luxury home"
            className="relative z-10 w-auto max-w-4xl h-auto object-contain drop-shadow-[0_28px_60px_rgba(17,35,46,0.32)]"
            style={{ maxHeight: '40vh' }}
          />
        </div>
      </div>
    </section>
  )
}
