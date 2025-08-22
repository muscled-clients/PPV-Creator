import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTikTokApiService } from '@/lib/services/tiktok-api-service'

/**
 * POST /api/tiktok/sync-views - Sync view counts for TikTok content links
 * Body: { application_id?: string, force_refresh?: boolean }
 * 
 * If application_id is provided, sync only that application's links
 * If not provided, sync all TikTok links that haven't been updated recently
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { application_id, force_refresh = false } = body

    // Check if we have TikTok API configured
    if (!process.env.TIKTOK_CLIENT_KEY) {
      return NextResponse.json(
        { error: 'TikTok API not configured' },
        { status: 503 }
      )
    }

    const { createClient: createDirectClient } = await import('@supabase/supabase-js')
    const supabase = createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Build query conditions
    let query = supabase
      .from('application_content_links')
      .select('*')
      .eq('platform', 'tiktok')
      .eq('is_selected', true) // Only sync selected/approved content

    if (application_id) {
      query = query.eq('application_id', application_id)
    } else if (!force_refresh) {
      // Only sync links that haven't been updated in the last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      query = query.or(`last_view_check.is.null,last_view_check.lt.${oneHourAgo}`)
    }

    const { data: tiktokLinks, error: linksError } = await query.limit(20) // Limit to prevent overload

    if (linksError) {
      console.error('Error fetching TikTok links:', linksError)
      return NextResponse.json(
        { error: 'Failed to fetch TikTok links' },
        { status: 500 }
      )
    }

    if (!tiktokLinks || tiktokLinks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No TikTok links to sync',
        updated_count: 0
      })
    }

    const tiktokService = getTikTokApiService()
    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each link
    for (const link of tiktokLinks) {
      try {
        const videoData = await tiktokService.getVideoData(link.content_url)
        
        if (videoData.success && videoData.data) {
          // Update the database with new view count
          const { error: updateError } = await supabase
            .from('application_content_links')
            .update({
              views_tracked: videoData.data.view_count,
              last_view_check: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Store additional metadata
              metadata: {
                like_count: videoData.data.like_count,
                comment_count: videoData.data.comment_count,
                share_count: videoData.data.share_count,
                title: videoData.data.title,
                author: videoData.data.author,
                last_sync: new Date().toISOString()
              }
            })
            .eq('id', link.id)

          if (updateError) {
            console.error('Error updating link:', updateError)
            errorCount++
            results.push({
              link_id: link.id,
              url: link.content_url,
              status: 'error',
              error: 'Database update failed'
            })
          } else {
            successCount++
            results.push({
              link_id: link.id,
              url: link.content_url,
              status: 'success',
              old_views: link.views_tracked || 0,
              new_views: videoData.data.view_count,
              views_gained: (videoData.data.view_count || 0) - (link.views_tracked || 0)
            })
          }
        } else {
          errorCount++
          results.push({
            link_id: link.id,
            url: link.content_url,
            status: 'error',
            error: videoData.error || 'Failed to fetch video data'
          })
        }

        // Add small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 200))
      } catch (error) {
        errorCount++
        console.error(`Error processing link ${link.id}:`, error)
        results.push({
          link_id: link.id,
          url: link.content_url,
          status: 'error',
          error: 'Processing error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${successCount} TikTok links successfully`,
      updated_count: successCount,
      error_count: errorCount,
      total_processed: tiktokLinks.length,
      results: results
    })

  } catch (error) {
    console.error('TikTok sync endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/tiktok/sync-views - Get sync status and recent sync results
 */
export async function GET(request: NextRequest) {
  try {
    const { createClient: createDirectClient } = await import('@supabase/supabase-js')
    const supabase = createDirectClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get stats about TikTok links
    const { data: stats, error: statsError } = await supabase
      .from('application_content_links')
      .select('id, last_view_check, views_tracked, is_selected')
      .eq('platform', 'tiktok')

    if (statsError) {
      return NextResponse.json(
        { error: 'Failed to fetch sync stats' },
        { status: 500 }
      )
    }

    const totalLinks = stats?.length || 0
    const selectedLinks = stats?.filter(link => link.is_selected).length || 0
    const recentlySynced = stats?.filter(link => {
      if (!link.last_view_check) return false
      const lastCheck = new Date(link.last_view_check)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return lastCheck > oneHourAgo
    }).length || 0

    const totalViews = stats?.reduce((sum, link) => sum + (link.views_tracked || 0), 0) || 0

    return NextResponse.json({
      success: true,
      stats: {
        total_tiktok_links: totalLinks,
        selected_links: selectedLinks,
        recently_synced: recentlySynced,
        total_views: totalViews,
        api_configured: !!process.env.TIKTOK_CLIENT_KEY
      }
    })

  } catch (error) {
    console.error('TikTok sync status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}