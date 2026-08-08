'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLogoutAction } from '@/app/actions/auth'
import { Home, MessageSquare, Star, LogOut, ExternalLink, Users, UserCog, Menu, X } from 'lucide-react'

interface AdminHeaderProps {
  newInquiriesCount?: number
  isSuperAdmin?: boolean
}

export default function AdminHeader({ newInquiriesCount = 0, isSuperAdmin = false }: AdminHeaderProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const navItems: Array<{ href: string; label: string; icon: typeof Home; badge?: number }> = [
    { href: '/admin/properties', label: 'Properties', icon: Home },
    { href: '/admin/contacts', label: 'Contacts', icon: MessageSquare, badge: newInquiriesCount },
    { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
    ...(isSuperAdmin ? [{ href: '/admin/users', label: 'Users', icon: Users }] : []),
  ]

  return (
    <header className="bg-black text-white sticky top-0 z-50">
      {/* Top row: logo + actions */}
      <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/properties" className="text-lg font-bold text-white whitespace-nowrap">
            Realest Admin
          </Link>
          <Link
            href="/"
            className="hidden sm:flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors border border-white/20 rounded-full px-2.5 py-1 whitespace-nowrap"
          >
            <ExternalLink className="h-3 w-3" />
            View Site
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/profile"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <UserCog className="h-4 w-4" />
            Profile
          </Link>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Nav row — desktop only */}
      <div className="hidden md:block border-t border-white/10 px-4 md:px-6 overflow-x-auto">
        <nav className="flex items-center gap-1 py-1 min-w-max">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors relative whitespace-nowrap ${
                pathname.startsWith(href)
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative ${
                pathname.startsWith(href)
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              {badge !== undefined && badge > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Link>
          ))}
          <div className="border-t border-white/10 my-2" />
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View Site
          </Link>
          <Link
            href="/profile"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <UserCog className="h-4 w-4" />
            Profile
          </Link>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      )}
    </header>
  )
}
