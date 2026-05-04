'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { User, LogOut, LogIn } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

interface NavbarProps {
  user?: { firstName: string; role: string } | null
}

export default function Navbar({ user }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold transition-colors duration-300" style={{ color: '#1a1a1a' }}>
          Realest
        </Link>
        <div className="flex items-center gap-8">
          {[
            { href: '/', label: 'Home' },
            { href: '/listings', label: 'Listings' },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link text-sm font-medium transition-all duration-300 hover:opacity-70 ${
                pathname === href || (href !== '/' && pathname.startsWith(href)) ? 'font-bold' : ''
              }`}
              style={{ color: '#1a1a1a' }}
            >
              {label}
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:opacity-70"
                style={{ color: '#1a1a1a' }}
              >
                <User className="h-4 w-4" />
                {user.firstName}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:opacity-70"
                  style={{ color: '#1a1a1a' }}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium transition-all duration-300 hover:opacity-70"
              style={{ color: '#1a1a1a' }}
            >
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
