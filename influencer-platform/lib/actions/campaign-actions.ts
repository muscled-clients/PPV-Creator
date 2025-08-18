'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface CreateCampaignData {
  title: string
  description: string
  requirements: string
  budget_amount: number
  payment_model: string
  cpm_rate?: number
  max_views?: number
  total_budget_calculated?: number
  start_date: string
  end_date: string
  platforms: string[]
  categories: string[]
  target_audience?: string
  deliverables?: string
}

export interface UpdateCampaignData {
  title?: string
  description?: string
  requirements?: string
  budget_amount?: number
  payment_model?: string
  cpm_rate?: number
  max_views?: number
  total_budget_calculated?: number
  start_date?: string
  end_date?: string
  platforms?: string[]
  categories?: string[]
  target_audience?: string
  deliverables?: string
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
}

export interface CampaignFilters {
  category?: string
  platform?: string
  min_budget?: number
  max_budget?: number
  search?: string
  status?: string
}

export async function createCampaign(data: CreateCampaignData) {
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
      return { success: false, error: 'Only brands can create campaigns' }
    }

    // Validate dates
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    const today = new Date()

    if (startDate < today) {
      return { success: false, error: 'Start date cannot be in the past' }
    }

    if (endDate <= startDate) {
      return { success: false, error: 'End date must be after start date' }
    }

    // Validate budget
    if (data.budget_amount <= 0) {
      return { success: false, error: 'Budget amount must be greater than 0' }
    }

    // Calculate reasonable defaults for required fields
    const daysUntilEnd = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const estimatedPosts = Math.max(1, Math.floor(daysUntilEnd / 7)) // Estimate 1 post per week
    const pricePerPost = Math.round(data.budget_amount / estimatedPosts)
    
    // Create campaign with all required fields
    const { data: campaign, error: createError } = await supabase
      .from('campaigns')
      .insert({
        brand_id: user.id,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        budget_amount: data.budget_amount,
        payment_model: data.payment_model || 'cpm',
        cpm_rate: data.cpm_rate,
        max_views: data.max_views,
        total_budget_calculated: data.total_budget_calculated,
        price_per_post: pricePerPost || data.budget_amount, // Calculate price per post
        slots_available: 10, // Default to 10 slots
        slots_filled: 0,
        submission_deadline: data.end_date, // Use end_date as submission deadline
        start_date: data.start_date,
        end_date: data.end_date,
        platforms: data.platforms,
        categories: data.categories,
        target_audience: data.target_audience,
        deliverables: data.deliverables,
        status: 'draft'
      })
      .select()
      .single()

    if (createError) {
      console.error('Campaign creation error:', createError)
      return { success: false, error: 'Failed to create campaign' }
    }

    revalidatePath('/brand/campaigns')
    return { success: true, data: campaign }
  } catch (error) {
    console.error('Campaign creation error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateCampaign(campaignId: string, data: UpdateCampaignData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user owns the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('brand_id, status')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    if (campaign.brand_id !== user.id) {
      return { success: false, error: 'You can only edit your own campaigns' }
    }

    // Validate status transitions
    if (data.status) {
      const validTransitions: Record<string, string[]> = {
        draft: ['active', 'cancelled'],
        active: ['paused', 'completed', 'cancelled'],
        paused: ['active', 'cancelled'],
        completed: [],
        cancelled: []
      }

      const allowedStatuses = validTransitions[campaign.status] || []
      if (!allowedStatuses.includes(data.status)) {
        return { 
          success: false, 
          error: `Cannot change status from ${campaign.status} to ${data.status}` 
        }
      }
    }

    // Validate dates if provided
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)

      if (endDate <= startDate) {
        return { success: false, error: 'End date must be after start date' }
      }
    }

    // Validate budget if provided
    if (data.budget_amount !== undefined && data.budget_amount <= 0) {
      return { success: false, error: 'Budget amount must be greater than 0' }
    }

    // Update campaign
    const { data: updatedCampaign, error: updateError } = await supabase
      .from('campaigns')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaignId)
      .select()
      .single()

    if (updateError) {
      console.error('Campaign update error:', updateError)
      return { success: false, error: 'Failed to update campaign' }
    }

    revalidatePath('/brand/campaigns')
    revalidatePath(`/brand/campaigns/${campaignId}`)
    return { success: true, data: updatedCampaign }
  } catch (error) {
    console.error('Campaign update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteCampaign(campaignId: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user owns the campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('brand_id, status')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    if (campaign.brand_id !== user.id) {
      return { success: false, error: 'You can only delete your own campaigns' }
    }

    // Only allow deletion of draft campaigns
    if (campaign.status !== 'draft') {
      return { success: false, error: 'Only draft campaigns can be deleted' }
    }

    // Delete campaign
    const { error: deleteError } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)

    if (deleteError) {
      console.error('Campaign deletion error:', deleteError)
      return { success: false, error: 'Failed to delete campaign' }
    }

    revalidatePath('/brand/campaigns')
    return { success: true }
  } catch (error) {
    console.error('Campaign deletion error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCampaigns(filters?: CampaignFilters, userRole?: string, userId?: string) {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        brand_profiles(company_name, avatar_url),
        campaign_applications!left(id, status, influencer_id),
        campaign_view_tracking(
          views_tracked,
          payout_calculated,
          payout_status,
          instagram_views,
          tiktok_views,
          last_checked_at
        )
      `)

    // Apply filters based on user role
    if (userRole === 'influencer') {
      // Influencers only see active campaigns
      query = query.eq('status', 'active')
    } else if (userRole === 'brand' && userId) {
      // Brands see their own campaigns
      query = query.eq('brand_id', userId)
    } else if (userRole === 'admin') {
      // Admins see all campaigns
    } else {
      // Public view (if any) - only active campaigns
      query = query.eq('status', 'active')
    }

    // Apply additional filters
    if (filters?.category) {
      query = query.contains('categories', [filters.category])
    }

    if (filters?.platform) {
      query = query.contains('platforms', [filters.platform])
    }

    if (filters?.min_budget) {
      query = query.gte('budget_amount', filters.min_budget)
    }

    if (filters?.max_budget) {
      query = query.lte('budget_amount', filters.max_budget)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%, description.ilike.%${filters.search}%`)
    }

    // Order by most recent
    query = query.order('created_at', { ascending: false })

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Get campaigns error:', error)
      return { success: false, error: 'Failed to fetch campaigns' }
    }

    return { success: true, data: campaigns || [] }
  } catch (error) {
    console.error('Get campaigns error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getCampaignById(campaignId: string, userRole?: string, userId?: string) {
  try {
    const supabase = await createClient()
    
    const { data: campaign, error } = await supabase
      .from('campaigns')
      .select(`
        *,
        brand_profiles(company_name, avatar_url, description, website),
        campaign_applications(
          id,
          status,
          message,
          proposed_rate,
          created_at,
          influencer_id
        )
      `)
      .eq('id', campaignId)
      .single()

    if (error) {
      console.error('Get campaign by ID error:', error)
      return { success: false, error: 'Failed to fetch campaign' }
    }
    
    if (!campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    // Check permissions
    if (userRole === 'brand' && campaign.brand_id !== userId) {
      return { success: false, error: 'You can only view your own campaigns' }
    }

    // Allow influencers to view active campaigns OR campaigns they've applied to
    if (userRole === 'influencer' && campaign.status !== 'active' && campaign.status !== 'paused') {
      return { success: false, error: 'Campaign not available' }
    }

    return { success: true, data: campaign }
  } catch (error) {
    console.error('Get campaign error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function publishCampaign(campaignId: string) {
  try {
    const result = await updateCampaign(campaignId, { status: 'active' })
    
    if (result.success) {
      revalidatePath('/influencer/campaigns')
    }
    
    return result
  } catch (error) {
    console.error('Publish campaign error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function pauseCampaign(campaignId: string) {
  return updateCampaign(campaignId, { status: 'paused' })
}

export async function completeCampaign(campaignId: string) {
  return updateCampaign(campaignId, { status: 'completed' })
}

export async function cancelCampaign(campaignId: string) {
  return updateCampaign(campaignId, { status: 'cancelled' })
}