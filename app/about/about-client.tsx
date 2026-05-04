'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Star, Users, Home, Award, Heart } from 'lucide-react'
import type { Agent } from '@/lib/types'

interface AboutClientProps {
  agents: Agent[]
  stats: {
    happyClients: number
    propertiesSold: number
    yearsExperience: number
    satisfactionRate: number
  }
}

export default function AboutClient({ agents, stats }: AboutClientProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 100)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section
        className="pt-32 pb-20 px-6"
        style={{ background: 'linear-gradient(135deg, #A8D5E2 0%, #e8f4f8 50%, #ffffff 100%)' }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: 'rgba(255,255,255,0.8)', color: '#1a1a1a' }}
            >
              About Us
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
              Your Trusted Real
              <br />
              <span style={{ color: '#2a7a9a' }}>Estate Partner</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Shree Ganesh Real Estate Consultants has been helping families and businesses find
              their perfect properties in Thane and beyond.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div
            className={`transition-all duration-1000 delay-200 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
            }`}
          >
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
            >
              Our Story
            </span>
            <h2 className="text-4xl font-bold text-black mb-6">
              Built on Trust, Driven by Excellence
            </h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Founded in the heart of Thane, Shree Ganesh Real Estate Consultants was established
              with a simple mission: to make property transactions transparent, efficient, and
              rewarding for every client. Our team of experienced professionals brings deep local
              knowledge and market expertise to every transaction.
            </p>
            <p className="text-gray-600 leading-relaxed mb-8">
              Located at Charai, Thane West, we specialize in residential and commercial
              properties across the Thane region. Whether you&apos;re buying your first home,
              investing in commercial real estate, or looking for rental properties, we have the
              expertise to guide you every step of the way.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              Get in Touch
            </Link>
          </div>
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}
          >
            <div className="rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80"
                alt="Our Office"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Our Track Record</h2>
            <p className="text-gray-600 text-lg">Numbers that speak for themselves</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Users, value: `${stats.happyClients}+`, label: 'Happy Clients' },
              { icon: Home, value: `${stats.propertiesSold}+`, label: 'Properties Sold' },
              { icon: Award, value: `${stats.yearsExperience}+`, label: 'Years Experience' },
              { icon: Star, value: `${stats.satisfactionRate}%`, label: 'Satisfaction Rate' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-8 text-center shadow-sm"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#A8D5E2' }}
                >
                  <stat.icon className="h-8 w-8 text-gray-700" />
                </div>
                <p className="text-4xl font-bold text-black mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      {agents.length > 0 && (
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span
                className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
                style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
              >
                Our Team
              </span>
              <h2 className="text-4xl font-bold text-black mb-4">Meet the Experts</h2>
              <p className="text-gray-600 text-lg">
                Dedicated professionals committed to your real estate success
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {agent.photo ? (
                      <img
                        src={agent.photo}
                        alt={`${agent.firstName} ${agent.lastName}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                        <span className="text-4xl font-bold text-slate-500">
                          {agent.firstName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-black">
                      {agent.firstName} {agent.lastName}
                    </h3>
                    {agent.specialties && agent.specialties.length > 0 && (
                      <p className="text-sm text-gray-500 mt-1">{agent.specialties[0]}</p>
                    )}
                    {agent.yearsOfExperience && (
                      <p className="text-sm text-gray-600 mt-2">
                        {agent.yearsOfExperience} years experience
                      </p>
                    )}
                    {agent.bio && (
                      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{agent.bio}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-6"
              style={{ backgroundColor: '#A8D5E2', color: '#1a1a1a' }}
            >
              Our Values
            </span>
            <h2 className="text-4xl font-bold text-black mb-4">What We Stand For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: CheckCircle2,
                title: 'Integrity',
                description:
                  'We believe in complete transparency in every transaction. No hidden costs, no surprises — just honest, straightforward real estate services.',
              },
              {
                icon: Award,
                title: 'Excellence',
                description:
                  'From property listings to final paperwork, we maintain the highest standards of quality and professionalism in everything we do.',
              },
              {
                icon: Heart,
                title: 'Client-First',
                description:
                  'Your needs are our priority. We listen, we understand, and we work tirelessly to find the perfect property match for you.',
              },
            ].map((value, i) => (
              <div key={i} className="bg-white rounded-3xl p-8 shadow-sm">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{ backgroundColor: '#A8D5E2' }}
                >
                  <value.icon className="h-7 w-7 text-gray-700" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-black mb-6">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Let our expert team guide you through every step of your real estate journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/listings"
              className="px-8 py-4 rounded-full font-medium transition-all hover:opacity-90 text-white"
              style={{ backgroundColor: '#1a1a1a' }}
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-full font-medium transition-all hover:opacity-90 border-2 border-black text-black"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
