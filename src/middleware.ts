import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Redirect authenticated users away from auth pages
  if (session && (pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // Protect dashboard and other protected routes
  if (!session && (pathname.startsWith('/dashboard') || pathname.startsWith('/trades') || pathname.startsWith('/analytics') || pathname.startsWith('/settings'))) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/trades/:path*', '/analytics/:path*', '/settings/:path*', '/auth/login', '/auth/register', '/auth/forgot-password', '/auth/reset-password'],
}
