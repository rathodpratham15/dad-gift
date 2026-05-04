import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl, auth: session } = req
  const isLoggedIn = !!session?.user
  const isAdmin = (session?.user as any)?.role === 'admin'

  const isAdminRoute = nextUrl.pathname.startsWith('/admin') && nextUrl.pathname !== '/admin/login'
  const isDashboardRoute = nextUrl.pathname.startsWith('/dashboard')

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/admin/login', nextUrl))
  }

  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
