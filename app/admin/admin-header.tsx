'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { adminLogoutAction } from '@/app/actions/auth'
import { Home, MessageSquare, Star, Plus, LogOut } from 'lucide-react'

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
    <header className="bg-black text-white px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/admin/properties" className="text-xl font-bold text-white">
          Realest Admin
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon, badge }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${
                pathname.startsWith(href)
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
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

        <div className="flex items-center gap-3">
          <Link
            href="/admin/properties/create"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white text-black hover:bg-gray-100 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Link>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  )
}
