'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLogoutAction } from '@/app/actions/auth'
import { Home, MessageSquare, Star, LogOut, ExternalLink } from 'lucide-react'

interface AdminHeaderProps {
  newInquiriesCount?: number
}

export default function AdminHeader({ newInquiriesCount = 0 }: AdminHeaderProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/admin/properties', label: 'Properties', icon: Home },
    { href: '/admin/contacts', label: 'Contacts', icon: MessageSquare, badge: newInquiriesCount },
    { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
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
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors border border-white/20 rounded-full px-2.5 py-1 whitespace-nowrap"
          >
            <ExternalLink className="h-3 w-3" />
            View Site
          </Link>
        </div>

        <div className="flex items-center gap-2">
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
      </div>

      {/* Nav row — scrollable on mobile */}
      <div className="border-t border-white/10 px-4 md:px-6 overflow-x-auto">
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
    </header>
  )
}
