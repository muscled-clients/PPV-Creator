'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ContentLinkData {
  platform: 'instagram' | 'tiktok'
  content_url: string
}

export interface CreateApplicationDataEnhanced {
  campaign_id: string
  message: string
  proposed_rate?: number
  deliverables?: string
  instagram_content_url?: string // For backward compatibility
  tiktok_content_url?: string // For backward compatibility
  content_links?: ContentLinkData[] // New field for multiple links
}

export interface UpdateApplicationDataEnhanced {
  message?: string
  proposed_rate?: number
  deliverables?: string
  status?: 'pending' | 'approved' | 'rejected'
  selected_link_ids?: string[] // For approving specific links
}

export async function createApplicationEnhanced(data: CreateApplicationDataEnhanced) {
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
      return { success: false, error: 'Campaign is not active' }
    }

    // Check if already applied
    const { data: existingApplication, error: existingError } = await supabase
      .from('campaign_applications')
      .select('id')
      .eq('campaign_id', data.campaign_id)
      .eq('influencer_id', user.id)
      .single()

    if (existingApplication) {
      return { success: false, error: 'You have already applied to this campaign' }
    }

    // Start a transaction by creating the application first
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: data.campaign_id,
        influencer_id: user.id,
        message: data.message,
        proposed_rate: data.proposed_rate,
        deliverables: data.deliverables,
        instagram_content_url: data.instagram_content_url || data.content_links?.find(l => l.platform === 'instagram')?.content_url,
        tiktok_content_url: data.tiktok_content_url || data.content_links?.find(l => l.platform === 'tiktok')?.content_url,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (applicationError || !application) {
      return { success: false, error: 'Failed to create application' }
    }

    // If content_links are provided, insert them into the new table
    if (data.content_links && data.content_links.length > 0) {
      const contentLinksToInsert = data.content_links.map(link => ({
        application_id: application.id,
        platform: link.platform,
        content_url: link.content_url,
        is_selected: false,
        selection_status: 'pending',
        views_tracked: 0,
        created_at: new Date().toISOString()
      }))

      const { error: linksError } = await supabase
        .from('application_content_links')
        .insert(contentLinksToInsert)

      if (linksError) {
        // Rollback by deleting the application if links fail to insert
        await supabase
          .from('campaign_applications')
          .delete()
          .eq('id', application.id)
        
        return { success: false, error: 'Failed to save content links' }
      }
    }

    // Revalidate relevant paths
    revalidatePath('/influencer/applications')
    revalidatePath('/influencer/campaigns')
    revalidatePath(`/influencer/campaigns/${data.campaign_id}`)
    revalidatePath('/brand/applications')

    return { success: true, data: application }
  } catch (error) {
    console.error('Error creating application:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateApplicationWithLinks(
  applicationId: string,
  data: UpdateApplicationDataEnhanced
) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get application with campaign info
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .select('*, campaigns(brand_id)')
      .eq('id', applicationId)
      .single()

    if (applicationError || !application) {
      return { success: false, error: 'Application not found' }
    }

    // Check permissions
    const isBrand = application.campaigns?.brand_id === user.id
    const isInfluencer = application.influencer_id === user.id

    if (!isBrand && !isInfluencer) {
      return { success: false, error: 'Unauthorized' }
    }
    
    if ((data.status === 'approved' || data.status === 'rejected') && !isBrand) {
      return { success: false, error: 'Only the brand can approve or reject applications' }
    }

    // Update application status
    const { error: updateError } = await supabase
      .from('campaign_applications')
      .update({
        status: data.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)

    if (updateError) {
      return { success: false, error: 'Failed to update application' }
    }

    // If this is an approval with selected links
    if (data.status === 'approved' && data.selected_link_ids && isBrand) {
      // Update all links for this application
      // First, mark all as not selected
      await supabase
        .from('application_content_links')
        .update({
          is_selected: false,
          selection_status: 'not_selected',
          selection_date: new Date().toISOString()
        })
        .eq('application_id', applicationId)

      // Then mark selected ones
      if (data.selected_link_ids.length > 0) {
        await supabase
          .from('application_content_links')
          .update({
            is_selected: true,
            selection_status: 'selected',
            selection_date: new Date().toISOString()
          })
          .eq('application_id', applicationId)
          .in('id', data.selected_link_ids)
      }
    }

    // If rejected, mark all links as not selected
    if (data.status === 'rejected' && isBrand) {
      await supabase
        .from('application_content_links')
        .update({
          is_selected: false,
          selection_status: 'not_selected',
          selection_date: new Date().toISOString()
        })
        .eq('application_id', applicationId)
    }


    // Revalidate relevant paths
    revalidatePath('/influencer/applications')
    revalidatePath('/brand/applications')
    revalidatePath(`/campaign/${application.campaign_id}`)

    return { success: true }
  } catch (error) {
    console.error('Error updating application:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getApplicationWithLinks(applicationId: string) {
  try {
    const supabase = await createClient()
    
    // Get application with all related data
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(
          id,
          title,
          brand_id,
          payment_model,
          cpm_rate
        ),
        influencer:user_profiles!campaign_applications_influencer_id_fkey(
          id,
          full_name,
          username,
          avatar_url
        )
      `)
      .eq('id', applicationId)
      .single()

    if (applicationError || !application) {
      return { success: false, error: 'Application not found' }
    }

    // Get content links for this application
    const { data: contentLinks, error: linksError } = await supabase
      .from('application_content_links')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: true })

    if (linksError) {
      return { success: false, error: 'Failed to fetch content links' }
    }

    return {
      success: true,
      data: {
        ...application,
        content_links: contentLinks || []
      }
    }
  } catch (error) {
    console.error('Error fetching application:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getApplicationsWithLinks(filters?: {
  campaign_id?: string
  influencer_id?: string
  brand_id?: string
  status?: string
}) {
  try {
    const supabase = await createClient()
    
    // Build query
    let query = supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(
          id,
          title,
          brand_id,
          payment_model,
          cpm_rate
        ),
        influencer:user_profiles!campaign_applications_influencer_id_fkey(
          id,
          full_name,
          username,
          avatar_url
        )
      `)

    // Apply filters
    if (filters?.campaign_id) {
      query = query.eq('campaign_id', filters.campaign_id)
    }
    if (filters?.influencer_id) {
      query = query.eq('influencer_id', filters.influencer_id)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.brand_id) {
      query = query.eq('campaigns.brand_id', filters.brand_id)
    }

    const { data: applications, error: applicationsError } = await query

    if (applicationsError) {
      return { success: false, error: 'Failed to fetch applications' }
    }

    // Get content links for all applications
    const applicationIds = applications?.map(app => app.id) || []
    
    if (applicationIds.length > 0) {
      const { data: allLinks, error: linksError } = await supabase
        .from('application_content_links')
        .select('*')
        .in('application_id', applicationIds)

      if (!linksError && allLinks) {
        // Group links by application
        const linksByApplication = allLinks.reduce((acc, link) => {
          if (!acc[link.application_id]) {
            acc[link.application_id] = []
          }
          acc[link.application_id].push(link)
          return acc
        }, {} as Record<string, typeof allLinks>)

        // Attach links to applications
        const applicationsWithLinks = applications?.map(app => ({
          ...app,
          content_links: linksByApplication[app.id] || []
        }))

        return { success: true, data: applicationsWithLinks }
      }
    }

    return { success: true, data: applications || [] }
  } catch (error) {
    console.error('Error fetching applications:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function withdrawApplication(applicationId: string) {
  try {
    console.log('[withdrawApplication] Starting withdrawal for:', applicationId)
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[withdrawApplication] User check:', user?.id, authError?.message)
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get application to verify ownership
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .select('*, campaigns(title)')
      .eq('id', applicationId)
      .single()

    console.log('[withdrawApplication] Application check:', application?.id, applicationError?.message)
    if (applicationError || !application) {
      return { success: false, error: 'Application not found' }
    }

    // Check if user is the influencer who applied
    console.log('[withdrawApplication] Permission check - User:', user.id, 'Application owner:', application.influencer_id)
    if (application.influencer_id !== user.id) {
      return { success: false, error: 'You can only withdraw your own applications' }
    }

    // Check if application is in a withdrawable state
    console.log('[withdrawApplication] Status check:', application.status)
    if (application.status === 'approved') {
      return { success: false, error: 'Cannot withdraw an approved application' }
    }

    // Delete content links first (if table exists)
    console.log('[withdrawApplication] Checking for content links...')
    const { error: checkError } = await supabase
      .from('application_content_links')
      .select('id')
      .eq('application_id', applicationId)
      .limit(1)
    
    // Only delete links if table exists
    if (!checkError) {
      console.log('[withdrawApplication] Deleting content links...')
      const { error: deleteLinksError } = await supabase
        .from('application_content_links')
        .delete()
        .eq('application_id', applicationId)
      
      if (deleteLinksError) {
        console.error('[withdrawApplication] Error deleting content links:', deleteLinksError)
        // Continue even if links deletion fails
      } else {
        console.log('[withdrawApplication] Content links deleted successfully')
      }
    } else {
      console.log('[withdrawApplication] Content links table not accessible or no links found')
    }

    // Delete the application
    console.log('[withdrawApplication] Deleting application...')
    const { error: deleteError } = await supabase
      .from('campaign_applications')
      .delete()
      .eq('id', applicationId)

    if (deleteError) {
      console.error('[withdrawApplication] Failed to delete application:', deleteError)
      return { success: false, error: 'Failed to withdraw application: ' + deleteError.message }
    }
    
    console.log('[withdrawApplication] Application deleted successfully')

    // Revalidate relevant paths
    revalidatePath('/influencer/applications')
    revalidatePath('/brand/applications')
    revalidatePath(`/influencer/campaigns/${application.campaign_id}`)

    return { 
      success: true, 
      message: `Application for "${application.campaigns?.title}" has been withdrawn. You can now apply again if needed.`
    }
  } catch (error) {
    console.error('Error withdrawing application:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}