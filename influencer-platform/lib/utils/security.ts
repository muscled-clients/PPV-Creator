import { NextRequest, NextResponse } from 'next/server'
import { logger } from './error-logger'

// Content Security Policy configuration
export function getCSPHeader(): string {
  const isDev = process.env.NODE_ENV === 'development'
  
  const directives = [
    "default-src 'self'",
    `script-src 'self' ${isDev ? "'unsafe-eval' 'unsafe-inline'" : "'nonce-{{nonce}}'"}`,
    `style-src 'self' ${isDev ? "'unsafe-inline'" : "'nonce-{{nonce}}'"} https://fonts.googleapis.com`,
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
    "media-src 'self' https: data:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
    isDev ? '' : "block-all-mixed-content",
  ].filter(Boolean).join('; ')
  
  return directives
}

// Rate limiting implementation
interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

class RateLimiter {
  private store: RateLimitStore = {}
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every minute
    if (typeof globalThis !== 'undefined' && globalThis.setInterval) {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  private cleanup() {
    const now = Date.now()
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key]
      }
    })
  }

  async check(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now()
    const key = identifier

    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + windowMs,
      }
    }

    const entry = this.store[key]
    entry.count++

    const allowed = entry.count <= limit
    const remaining = Math.max(0, limit - entry.count)

    if (!allowed) {
      logger.warn('Rate limit exceeded', { identifier, count: entry.count, limit })
    }

    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
    }
  }

  reset(identifier: string) {
    delete this.store[identifier]
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
  }
}

export const rateLimiter = new RateLimiter()

// Rate limiting middleware
export async function withRateLimit(
  request: NextRequest,
  handler: () => Promise<NextResponse>,
  options?: {
    limit?: number
    windowMs?: number
    identifier?: string
  }
): Promise<NextResponse> {
  if (process.env.RATE_LIMIT_ENABLED !== 'true') {
    return handler()
  }

  const identifier = options?.identifier || 
    request.headers.get('x-forwarded-for') || 
    request.headers.get('x-real-ip') || 
    'unknown'

  const { allowed, remaining, resetTime } = await rateLimiter.check(
    identifier,
    options?.limit || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    options?.windowMs || parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000')
  )

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(options?.limit || 100),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
        },
      }
    )
  }

  const response = await handler()
  
  response.headers.set('X-RateLimit-Limit', String(options?.limit || 100))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
  
  return response
}

// CSRF token generation and validation
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false
  return token === storedToken
}

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// SQL injection prevention helper
export function escapeSQLIdentifier(identifier: string): string {
  // Only allow alphanumeric characters and underscores
  return identifier.replace(/[^a-zA-Z0-9_]/g, '')
}

// XSS prevention helper
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, m => map[m])
}