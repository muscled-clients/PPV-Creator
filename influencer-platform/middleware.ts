import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_PATHS = ['/influencer', '/brand', '/admin']
const PUBLIC_PATHS = ['/', '/auth/login', '/auth/register', '/auth/forgot-password', '/help', '/search']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Performance: Early return for static assets and public paths
  const isPublicPath = PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith('/auth/'))
  if (isPublicPath && !pathname.startsWith('/admin')) {
    return NextResponse.next()
  }
  
  // Create response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })
  
  // Create Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )
  
  // Get the user session
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if path is protected
  const isProtectedPath = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  
  if (isProtectedPath) {
    // Check if user is authenticated
    if (!user) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Get user role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    // Role-based routing
    if (pathname.startsWith('/influencer') && profile?.role !== 'influencer') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    if (pathname.startsWith('/brand') && profile?.role !== 'brand') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    
    // Add security headers for protected routes
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // Cache control for sensitive pages
    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    )
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
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