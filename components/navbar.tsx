'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { User, LogOut, LogIn, Menu, X } from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

interface NavbarProps {
  user?: { firstName: string; role: string } | null
  lightBg?: boolean
  solid?: boolean
}

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Listings' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export default function Navbar({ user, lightBg, solid }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setDropdownOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          solid || scrolled || mobileOpen ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={solid || lightBg || scrolled || mobileOpen ? '/logo-blue.png' : '/logo-white.png'}
              alt="Realest logo"
              width={44}
              height={44}
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-black">Realest</span>
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
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold cursor-pointer hover:bg-black/80 transition-colors"
                >
                  {user.firstName[0].toUpperCase()}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href={user.role === 'admin' ? '/admin/properties' : '/dashboard'}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </form>
                  </div>
                )}
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
                    {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
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
