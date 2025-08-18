'use server'

import { createClient } from '@/lib/supabase/server'

export interface ViewTrackingData {
  campaign_id: string
  influencer_id: string
  submission_id?: string
  instagram_views?: number
  tiktok_views?: number
}

export interface UpdateViewsData {
  instagram_views?: number
  tiktok_views?: number
}

/**
 * Create or update view tracking for a campaign submission
 */
export async function trackViews(data: ViewTrackingData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get campaign details to check payment model
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('payment_model, cpm_rate, max_views')
      .eq('id', data.campaign_id)
      .single()

    if (campaignError || !campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    // Only track views for CPM campaigns
    if (campaign.payment_model !== 'cpm') {
      return { success: false, error: 'View tracking only available for CPM campaigns' }
    }

    // Check if tracking record exists
    const { data: existingTracking, error: fetchError } = await supabase
      .from('campaign_view_tracking')
      .select('*')
      .eq('campaign_id', data.campaign_id)
      .eq('influencer_id', data.influencer_id)
      .single()

    let trackingResult
    
    if (existingTracking) {
      // Update existing tracking
      const totalViews = (data.instagram_views || 0) + (data.tiktok_views || 0)
      const payoutCalculated = Math.min(
        (totalViews / 1000) * campaign.cpm_rate,
        (campaign.max_views / 1000) * campaign.cpm_rate
      )

      const { data: updated, error: updateError } = await supabase
        .from('campaign_view_tracking')
        .update({
          instagram_views: data.instagram_views || existingTracking.instagram_views,
          tiktok_views: data.tiktok_views || existingTracking.tiktok_views,
          views_tracked: totalViews,
          payout_calculated: payoutCalculated,
          last_checked_at: new Date().toISOString(),
          submission_id: data.submission_id || existingTracking.submission_id
        })
        .eq('id', existingTracking.id)
        .select()
        .single()

      if (updateError) {
        return { success: false, error: 'Failed to update view tracking' }
      }
      
      trackingResult = updated
    } else {
      // Create new tracking record
      const totalViews = (data.instagram_views || 0) + (data.tiktok_views || 0)
      const payoutCalculated = Math.min(
        (totalViews / 1000) * campaign.cpm_rate,
        (campaign.max_views / 1000) * campaign.cpm_rate
      )

      const { data: created, error: createError } = await supabase
        .from('campaign_view_tracking')
        .insert({
          campaign_id: data.campaign_id,
          influencer_id: data.influencer_id,
          submission_id: data.submission_id,
          instagram_views: data.instagram_views || 0,
          tiktok_views: data.tiktok_views || 0,
          views_tracked: totalViews,
          payout_calculated: payoutCalculated,
          last_checked_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.error('Create tracking error:', createError)
        return { success: false, error: 'Failed to create view tracking' }
      }
      
      trackingResult = created
    }

    return { success: true, data: trackingResult }
  } catch (error) {
    console.error('View tracking error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Get view tracking for a specific campaign and influencer
 */
export async function getViewTracking(campaignId: string, influencerId?: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    let query = supabase
      .from('campaign_view_tracking')
      .select(`
        *,
        campaigns(
          title,
          payment_model,
          cpm_rate,
          max_views
        ),
        users:influencer_id(
          id,
          email
        )
      `)
      .eq('campaign_id', campaignId)

    if (influencerId) {
      query = query.eq('influencer_id', influencerId)
    }

    const { data: tracking, error: trackingError } = await query

    if (trackingError) {
      console.error('Fetch tracking error:', trackingError)
      return { success: false, error: 'Failed to fetch view tracking' }
    }

    return { success: true, data: tracking }
  } catch (error) {
    console.error('Get view tracking error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Approve payout for a creator's views
 */
export async function approvePayout(trackingId: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user is a brand
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'brand') {
      return { success: false, error: 'Only brands can approve payouts' }
    }

    // Get tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('campaign_view_tracking')
      .select(`
        *,
        campaigns(brand_id)
      `)
      .eq('id', trackingId)
      .single()

    if (trackingError || !tracking) {
      return { success: false, error: 'Tracking record not found' }
    }

    // Verify ownership
    if (tracking.campaigns?.brand_id !== user.id) {
      return { success: false, error: 'You can only approve payouts for your own campaigns' }
    }

    // Update payout status
    const { data: updated, error: updateError } = await supabase
      .from('campaign_view_tracking')
      .update({
        payout_status: 'approved'
      })
      .eq('id', trackingId)
      .select()
      .single()

    if (updateError) {
      return { success: false, error: 'Failed to approve payout' }
    }

    // Create transaction record
    await supabase
      .from('transactions')
      .insert({
        user_id: tracking.influencer_id,
        campaign_id: tracking.campaign_id,
        amount: tracking.payout_calculated,
        type: 'earning',
        status: 'pending',
        description: `CPM payout for ${tracking.views_tracked} views`
      })

    return { success: true, data: updated }
  } catch (error) {
    console.error('Approve payout error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Calculate potential payout based on views
 */
export function calculateCPMPayout(views: number, cpmRate: number, maxViews: number): number {
  const cappedViews = Math.min(views, maxViews)
  return (cappedViews / 1000) * cpmRate
}