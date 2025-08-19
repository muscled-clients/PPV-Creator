import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://influencer-platform-seven.vercel.app'
  const isProduction = process.env.NODE_ENV === 'production'
  
  const robotsTxt = isProduction
    ? `# Influencer Platform Robots.txt
User-agent: *
Allow: /
Allow: /search
Allow: /help
Disallow: /api/
Disallow: /admin/
Disallow: /brand/
Disallow: /influencer/
Disallow: /auth/
Disallow: /_next/
Disallow: /unauthorized

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay
User-agent: *
Crawl-delay: 1

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: DotBot
Disallow: /

User-agent: MJ12bot
Disallow: /
`
    : `# Development Environment - Block all crawlers
User-agent: *
Disallow: /
`
  
  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}