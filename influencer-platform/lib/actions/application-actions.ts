'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CreateApplicationData {
  campaign_id: string
  message: string
  proposed_rate?: number
  deliverables?: string
  instagram_content_url?: string
  tiktok_content_url?: string
}

export interface UpdateApplicationData {
  message?: string
  proposed_rate?: number
  deliverables?: string
  instagram_content_url?: string
  tiktok_content_url?: string
  status?: 'pending' | 'approved' | 'rejected' | 'withdrawn'
}

export async function createApplication(data: CreateApplicationData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user is an influencer
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || !userData || userData.role !== 'influencer') {
      return { success: false, error: 'Only influencers can apply to campaigns' }
    }

    // Verify campaign exists and is active
    const { data: campaign, error: campaignError } = await supabase
      .from('campaigns')
      .select('id, status, brand_id, end_date')
      .eq('id', data.campaign_id)
      .single()

    if (campaignError || !campaign) {
      return { success: false, error: 'Campaign not found' }
    }

    if (campaign.status !== 'active') {
      return { success: false, error: 'Campaign is not accepting applications' }
    }

    // Check if campaign has ended
    const endDate = new Date(campaign.end_date)
    if (endDate < new Date()) {
      return { success: false, error: 'Campaign has ended' }
    }

    // Check if user already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', data.campaign_id)
      .eq('influencer_id', user.id)
      .single()

    if (existingApplication) {
      return { success: false, error: 'You have already applied to this campaign' }
    }

    // Validate message length
    if (!data.message || data.message.trim().length < 10) {
      return { success: false, error: 'Application message must be at least 10 characters long' }
    }

    // Create application
    const { data: application, error: createError } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: data.campaign_id,
        influencer_id: user.id,
        message: data.message.trim(),
        proposed_rate: data.proposed_rate,
        deliverables: data.deliverables?.trim(),
        instagram_content_url: data.instagram_content_url?.trim(),
        tiktok_content_url: data.tiktok_content_url?.trim(),
        status: 'pending'
      })
      .select()
      .single()

    if (createError) {
      console.error('Application creation error:', createError)
      return { success: false, error: 'Failed to submit application' }
    }

    // Create notification for brand
    await supabase
      .from('notifications')
      .insert({
        user_id: campaign.brand_id,
        type: 'new_application',
        title: 'New Campaign Application',
        message: `You have received a new application for your campaign`,
        related_id: application.id
      })

    revalidatePath('/influencer/campaigns')
    revalidatePath(`/influencer/campaigns/${data.campaign_id}`)
    revalidatePath('/brand/applications')
    
    return { success: true, data: application }
  } catch (error) {
    console.error('Application creation error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateApplication(applicationId: string, data: UpdateApplicationData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get application details
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(brand_id, status)
      `)
      .eq('id', applicationId)
      .single()

    if (applicationError || !application) {
      return { success: false, error: 'Application not found' }
    }

    // Check permissions
    const userRole = await getUserRole(user.id)
    if (userRole === 'influencer' && application.influencer_id !== user.id) {
      return { success: false, error: 'You can only edit your own applications' }
    }

    if (userRole === 'brand' && application.campaigns?.brand_id !== user.id) {
      return { success: false, error: 'You can only edit applications for your campaigns' }
    }

    // Validate status changes
    if (data.status) {
      if (userRole === 'influencer' && data.status !== 'withdrawn') {
        return { success: false, error: 'Influencers can only withdraw applications' }
      }

      if (userRole === 'brand' && !['approved', 'rejected'].includes(data.status)) {
        return { success: false, error: 'Brands can only approve or reject applications' }
      }

      if (application.status === 'withdrawn') {
        return { success: false, error: 'Cannot modify withdrawn application' }
      }
    }

    // Update application
    const { data: updatedApplication, error: updateError } = await supabase
      .from('campaign_applications')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (updateError) {
      console.error('Application update error:', updateError)
      return { success: false, error: 'Failed to update application' }
    }

    // Create notification if status changed
    if (data.status && data.status !== application.status) {
      const notificationData = {
        type: data.status === 'approved' ? 'application_approved' : 
              data.status === 'rejected' ? 'application_rejected' : 
              'application_withdrawn',
        title: data.status === 'approved' ? 'Application Approved!' : 
               data.status === 'rejected' ? 'Application Rejected' : 
               'Application Withdrawn',
        message: data.status === 'approved' ? 'Your application has been approved!' : 
                data.status === 'rejected' ? 'Your application was not selected this time' : 
                'Application has been withdrawn',
        related_id: applicationId
      }

      if (userRole === 'brand') {
        // Notify influencer
        await supabase
          .from('notifications')
          .insert({
            user_id: application.influencer_id,
            ...notificationData
          })
      } else {
        // Notify brand
        await supabase
          .from('notifications')
          .insert({
            user_id: application.campaigns?.brand_id,
            ...notificationData
          })
      }
    }

    revalidatePath('/brand/applications')
    revalidatePath('/influencer/campaigns')
    
    return { success: true, data: updatedApplication }
  } catch (error) {
    console.error('Application update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getApplications(filters?: { campaign_id?: string, influencer_id?: string, status?: string }) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const userRole = await getUserRole(user.id)

    let query = supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(title, budget_amount, end_date, brand_id),
        users(full_name, email),
        influencer_profiles(username, follower_count, reputation_score, avatar_url)
      `)

    // Apply role-based filters
    if (userRole === 'influencer') {
      query = query.eq('influencer_id', user.id)
    } else if (userRole === 'brand') {
      query = query.eq('campaigns.brand_id', user.id)
    } else if (userRole !== 'admin') {
      return { success: false, error: 'Unauthorized' }
    }

    // Apply additional filters
    if (filters?.campaign_id) {
      query = query.eq('campaign_id', filters.campaign_id)
    }

    if (filters?.influencer_id) {
      query = query.eq('influencer_id', filters.influencer_id)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // Order by most recent
    query = query.order('created_at', { ascending: false })

    const { data: applications, error } = await query

    if (error) {
      console.error('Get applications error:', error)
      return { success: false, error: 'Failed to fetch applications' }
    }

    return { success: true, data: applications || [] }
  } catch (error) {
    console.error('Get applications error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getApplicationById(applicationId: string) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: application, error } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(
          title,
          description,
          budget_amount,
          requirements,
          brand_id,
          brand_profiles(company_name, avatar_url)
        ),
        users(full_name, email),
        influencer_profiles(
          username,
          follower_count,
          reputation_score,
          avatar_url,
          instagram_handle,
          tiktok_handle
        )
      `)
      .eq('id', applicationId)
      .single()

    if (error || !application) {
      return { success: false, error: 'Application not found' }
    }

    // Check permissions
    const userRole = await getUserRole(user.id)
    if (userRole === 'influencer' && application.influencer_id !== user.id) {
      return { success: false, error: 'You can only view your own applications' }
    }

    if (userRole === 'brand' && application.campaigns?.brand_id !== user.id) {
      return { success: false, error: 'You can only view applications for your campaigns' }
    }

    return { success: true, data: application }
  } catch (error) {
    console.error('Get application error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function approveApplication(applicationId: string) {
  return updateApplication(applicationId, { status: 'approved' })
}

export async function rejectApplication(applicationId: string) {
  return updateApplication(applicationId, { status: 'rejected' })
}

export async function withdrawApplication(applicationId: string) {
  return updateApplication(applicationId, { status: 'withdrawn' })
}

// Helper function to get user role
async function getUserRole(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return data?.role
}