'use client'

import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-5">
            <h3 className="text-2xl font-bold mb-4">Realest</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted real estate agency for luxury homes, offering exquisite properties.
            </p>
            <div className="mt-6">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm text-gray-300 hover:text-white hover:border-white/40 transition-colors"
                >
                  Talk to our team
                </Link>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/listings" className="text-gray-400 hover:text-white transition-colors">
                  Listings
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/testimonials/share" className="text-gray-400 hover:text-white transition-colors">
                  Share Testimonial
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-gray-800">
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/listings" className="text-gray-400 hover:text-white transition-colors">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link href="/contact?intent=sell" className="text-gray-400 hover:text-white transition-colors">
                  Sell Property
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Agent Consultation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Realest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
