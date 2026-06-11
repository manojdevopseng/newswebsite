import { auth } from '@/lib/admin/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn   = !!req.auth
  const isLoginPage  = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')

  // Logged in + on login page → redirect to dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  // Not logged in + admin route → redirect to login
  if (!isLoggedIn && isAdminRoute && !isLoginPage) {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  const res = NextResponse.next()

  // Add X-Robots-Tag: noindex to all non-production hosts
  // Prevents Vercel preview URLs from being indexed by Google
  const host = req.headers.get('host') ?? ''
  const isProduction = host === 'techpulseglobe.com' || host === 'www.techpulseglobe.com'
  if (!isProduction) {
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return res
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
