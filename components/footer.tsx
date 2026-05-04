'use client'

import Link from 'next/link'
import { Linkedin, Youtube, Twitter, Facebook, Instagram } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const mainPages = [
    { name: 'Home', href: '' },
    { name: 'Listings', href: '/listings' },
    { name: 'Blog', href: '/blog' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
    { name: 'Youtube', icon: Youtube, href: '#' },
    { name: 'X (Twitter)', icon: Twitter, href: '#' },
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'TikTok', icon: Youtube, href: '#' },
  ]

  return (
    <footer className="bg-slate-900 text-white border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold mb-4">Realest</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Framer template crafted for real estate agencies ready to elevate their online presence.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-white">Main pages</h4>
            <ul className="space-y-3">
              {mainPages.map((page) => (
                <li key={page.name}>
                  <Link
                    href={page.href}
                    className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                  >
                    {page.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-white">Other pages</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/listings"
                  className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                >
                  Listing
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                >
                  Agent
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-slate-400 hover:text-white text-sm transition-colors inline-block hover:translate-x-1 transform duration-200"
                >
                  404
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-5 text-white">Follow us</h4>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-slate-400 hover:text-white transition-all duration-300 hover:scale-110"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            Copyright © {currentYear} All rights reserved
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-slate-400 hover:text-white text-sm transition-colors"
            >
              Privacy policy
            </Link>
            <span className="text-slate-400 text-sm">Made by Amar KZR</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
