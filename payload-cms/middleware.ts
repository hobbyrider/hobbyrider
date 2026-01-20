import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Ensure PayloadCMS handles its own routes
  // Don't redirect /admin to /login - let PayloadCMS handle it
  const pathname = request.nextUrl.pathname
  
  // If accessing /login, redirect to /admin (PayloadCMS's login is at /admin)
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
