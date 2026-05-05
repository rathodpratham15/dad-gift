'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, LogOut, LogIn, Menu, X } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

interface NavbarProps {
  user?: { firstName: string; role: string } | null
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Listings' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar({ user }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-black">
            Realest
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-all duration-200 relative ${
                  isActive(href)
                    ? 'font-semibold text-black after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-[2px] after:bg-black after:rounded-full'
                    : 'font-medium text-black/70 hover:text-black'
                }`}
              >
                {label}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  href={user.role === 'admin' ? '/admin/properties' : '/dashboard'}
                  className="flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black transition-colors"
                >
                  <User className="h-4 w-4" />
                  {user.firstName}
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-black/80 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-black hover:bg-black/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-black/10 bg-white/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm py-2 transition-colors ${
                  isActive(href) ? 'font-semibold text-black' : 'font-medium text-black/70'
                }`}
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-black/10 pt-4">
              {user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href={user.role === 'admin' ? '/admin/properties' : '/dashboard'}
                    className="flex items-center gap-2 text-sm font-medium text-black/70"
                  >
                    <User className="h-4 w-4" />
                    {user.firstName}
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex items-center gap-2 text-sm font-medium text-black/70"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 text-sm font-medium text-black"
                >
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
