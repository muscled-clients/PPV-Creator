import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { checkAuth } from '@/lib/auth/middleware'

const PROTECTED_PATHS = ['/influencer', '/brand', '/admin']
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/help', '/search']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Performance: Early return for public paths
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith('/auth/'))
  if (isPublicPath && !pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // Update Supabase session
  const response = await updateSession(request)
  
  // Check if path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    const authResponse = await checkAuth(request)
    
    // Add security headers for protected routes
    if (authResponse) {
      authResponse.headers.set('X-Content-Type-Options', 'nosniff')
      authResponse.headers.set('X-Frame-Options', 'DENY')
      authResponse.headers.set('X-XSS-Protection', '1; mode=block')
      authResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
      
      // Cache control for sensitive pages
      authResponse.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, proxy-revalidate'
      )
      authResponse.headers.set('Pragma', 'no-cache')
      authResponse.headers.set('Expires', '0')
    }
    
    return authResponse
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (unless specifically needed)
     * - static assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
}