import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  
  // Check if request is for payload subdomain
  const isPayloadSubdomain = hostname.startsWith('payload.') || 
                             hostname === 'payload.hobbyrider.io' ||
                             hostname.includes('payload.hobbyrider.io')

  // If it's the payload subdomain, allow it to proceed
  // PayloadCMS routes will handle the rest
  if (isPayloadSubdomain) {
    // Allow PayloadCMS routes to be accessible
    return NextResponse.next()
  }

  // For main domain, block PayloadCMS routes
  if (request.nextUrl.pathname.startsWith('/admin') && 
      request.nextUrl.pathname.startsWith('/admin/payload')) {
    return NextResponse.redirect(new URL('/', request.url))
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
