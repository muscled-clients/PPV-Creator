import { NextRequest, NextResponse } from 'next/server'
import { getTikTokApiService } from '@/lib/services/tiktok-api-service'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/tiktok/video - Fetch TikTok video data
 * Query params: url (required) - TikTok video URL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const videoUrl = searchParams.get('url')

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    if (!videoUrl.includes('tiktok.com')) {
      return NextResponse.json(
        { error: 'Invalid TikTok URL' },
        { status: 400 }
      )
    }

    const tiktokService = getTikTokApiService()
    const result = await tiktokService.getVideoData(videoUrl)

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result.data,
        rate_limit_remaining: result.rate_limit_remaining
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('TikTok API endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tiktok/video/batch - Fetch multiple TikTok videos data
 * Body: { urls: string[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { urls } = body

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required' },
        { status: 400 }
      )
    }

    // Limit batch size to prevent abuse
    if (urls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 URLs allowed per batch request' },
        { status: 400 }
      )
    }

    // Validate all URLs
    for (const url of urls) {
      if (!url.includes('tiktok.com')) {
        return NextResponse.json(
          { error: `Invalid TikTok URL: ${url}` },
          { status: 400 }
        )
      }
    }

    const tiktokService = getTikTokApiService()
    const result = await tiktokService.getMultipleVideosData(urls)

    return NextResponse.json({
      success: result.success,
      results: result.results,
      rate_limit_remaining: result.rate_limit_remaining
    })
  } catch (error) {
    console.error('TikTok batch API endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}