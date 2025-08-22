'use server'

import { createClient } from '@/lib/supabase/server'

interface ViewTrackingResult {
  success: boolean
  data?: {
    linkId: string
    platform: 'instagram' | 'tiktok'
    newViews: number
    totalViews: number
  }[]
  error?: string
}

/**
 * Tracks views for selected content links only
 * This should be called periodically (e.g., via cron job) to update view counts
 */
export async function trackViewsForSelectedLinks(
  applicationId: string
): Promise<ViewTrackingResult> {
  try {
    const supabase = await createClient()
    
    // Get all selected links for this application
    const { data: selectedLinks, error: linksError } = await supabase
      .from('application_content_links')
      .select('*')
      .eq('application_id', applicationId)
      .eq('is_selected', true)
      .eq('selection_status', 'selected')

    if (linksError || !selectedLinks) {
      return { success: false, error: 'Failed to fetch selected links' }
    }

    if (selectedLinks.length === 0) {
      return { success: true, data: [] }
    }

    const trackingResults = []

    for (const link of selectedLinks) {
      // Simulate API call to Instagram/TikTok to get view counts
      // In production, this would be actual API calls
      const currentViews = await fetchViewsFromPlatform(link.content_url, link.platform)
      
      if (currentViews !== null) {
        const newViews = currentViews - (link.views_tracked || 0)
        
        // Update the view count in database
        const { error: updateError } = await supabase
          .from('application_content_links')
          .update({
            views_tracked: currentViews,
            last_view_check: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', link.id)

        if (!updateError) {
          trackingResults.push({
            linkId: link.id,
            platform: link.platform,
            newViews,
            totalViews: currentViews
          })
        }
      }
    }

    // Update campaign view tracking summary
    await updateCampaignViewTracking(applicationId, trackingResults)

    return { success: true, data: trackingResults }
  } catch (error) {
    console.error('Error tracking views:', error)
    return { success: false, error: 'Failed to track views' }
  }
}

/**
 * Fetch view count from social media platform
 * Now integrates with real TikTok API
 */
async function fetchViewsFromPlatform(
  contentUrl: string,
  platform: 'instagram' | 'tiktok'
): Promise<number | null> {
  
  if (platform === 'instagram') {
    // Instagram API integration placeholder
    // For now, return null to indicate no real data
    // TODO: Implement Instagram Graph API integration
    console.log('Instagram API integration not yet implemented')
    return null
  }
  
  if (platform === 'tiktok') {
    try {
      const { getTikTokApiService } = await import('./tiktok-api-service')
      const tiktokService = getTikTokApiService()
      
      const result = await tiktokService.getVideoData(contentUrl)
      
      if (result.success && result.data) {
        console.log(`TikTok views fetched for ${contentUrl}: ${result.data.view_count}`)
        return result.data.view_count
      } else {
        console.error(`Failed to fetch TikTok views: ${result.error}`)
        return null
      }
    } catch (error) {
      console.error('Error fetching TikTok views:', error)
      return null
    }
  }
    
    // Simulated data for testing
    const currentViews = Math.floor(Math.random() * 10000) + 1000
    return currentViews
  }
  
  if (platform === 'tiktok') {
    // Example TikTok API integration:
    // const tiktokApi = new TikTokAPI()
    // const videoId = extractVideoIdFromUrl(contentUrl)
    // const metrics = await tiktokApi.getVideoMetrics(videoId)
    // return metrics.playCount || 0
    
    // Simulated data for testing
    const currentViews = Math.floor(Math.random() * 50000) + 5000
    return currentViews
  }
  
  return null
}

/**
 * Update campaign view tracking summary
 */
async function updateCampaignViewTracking(
  applicationId: string,
  trackingResults: any[]
) {
  try {
    const supabase = await createClient()
    
    // Get application and campaign details
    const { data: application } = await supabase
      .from('campaign_applications')
      .select('campaign_id, influencer_id')
      .eq('id', applicationId)
      .single()

    if (!application) return

    // Calculate total views from all selected links
    const { data: allLinks } = await supabase
      .from('application_content_links')
      .select('views_tracked')
      .eq('application_id', applicationId)
      .eq('is_selected', true)

    const totalViews = allLinks?.reduce((sum, link) => sum + (link.views_tracked || 0), 0) || 0

    // Check if tracking record exists
    const { data: existingTracking } = await supabase
      .from('campaign_view_tracking')
      .select('id')
      .eq('campaign_id', application.campaign_id)
      .eq('influencer_id', application.influencer_id)
      .single()

    if (existingTracking) {
      // Update existing record
      await supabase
        .from('campaign_view_tracking')
        .update({
          views_tracked: totalViews,
          last_checked_at: new Date().toISOString()
        })
        .eq('id', existingTracking.id)
    } else {
      // Create new tracking record
      await supabase
        .from('campaign_view_tracking')
        .insert({
          campaign_id: application.campaign_id,
          influencer_id: application.influencer_id,
          views_tracked: totalViews,
          last_checked_at: new Date().toISOString()
        })
    }
  } catch (error) {
    console.error('Error updating campaign view tracking:', error)
  }
}

/**
 * Calculate earnings based on views and CPM rate
 */
export async function calculateEarnings(
  applicationId: string
): Promise<{ success: boolean; earnings?: number; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get application with campaign details
    const { data: application, error: appError } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(
          payment_model,
          cpm_rate,
          price_per_post
        )
      `)
      .eq('id', applicationId)
      .single()

    if (appError || !application) {
      return { success: false, error: 'Application not found' }
    }

    // If fixed payment model, return the fixed price
    if (application.campaigns?.payment_model === 'fixed') {
      return { 
        success: true, 
        earnings: application.proposed_rate || application.campaigns.price_per_post || 0 
      }
    }

    // If CPM model, calculate based on views
    if (application.campaigns?.payment_model === 'cpm' && application.campaigns?.cpm_rate) {
      // Get total views from selected links
      const { data: selectedLinks } = await supabase
        .from('application_content_links')
        .select('views_tracked')
        .eq('application_id', applicationId)
        .eq('is_selected', true)

      const totalViews = selectedLinks?.reduce((sum, link) => sum + (link.views_tracked || 0), 0) || 0
      const earnings = (totalViews / 1000) * application.campaigns.cpm_rate

      return { success: true, earnings }
    }

    return { success: false, error: 'Invalid payment model' }
  } catch (error) {
    console.error('Error calculating earnings:', error)
    return { success: false, error: 'Failed to calculate earnings' }
  }
}

/**
 * Batch update views for multiple applications
 * Useful for cron jobs
 */
export async function batchUpdateViews(
  campaignId?: string
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    const supabase = await createClient()
    
    // Get all approved applications with selected links
    let query = supabase
      .from('campaign_applications')
      .select('id')
      .eq('status', 'approved')

    if (campaignId) {
      query = query.eq('campaign_id', campaignId)
    }

    const { data: applications, error: appsError } = await query

    if (appsError || !applications) {
      return { success: false, updated: 0, error: 'Failed to fetch applications' }
    }

    let updatedCount = 0

    for (const app of applications) {
      const result = await trackViewsForSelectedLinks(app.id)
      if (result.success && result.data && result.data.length > 0) {
        updatedCount++
      }
    }

    return { success: true, updated: updatedCount }
  } catch (error) {
    console.error('Error in batch update:', error)
    return { success: false, updated: 0, error: 'Batch update failed' }
  }
}