'use server'

import { createClient } from '@/lib/supabase/server'

export async function ensureUserProfile() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { error: 'Not authenticated' }
  }

  // Check if user profile exists
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return { error: 'User profile not found' }
  }

  // Check if role-specific profile exists
  if (profile.role === 'influencer') {
    const { data: influencerProfile } = await supabase
      .from('influencer_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!influencerProfile) {
      // Create influencer profile
      const { error: createError } = await supabase
        .from('influencer_profiles')
        .insert({
          user_id: user.id
        })

      if (createError && !createError.message.includes('duplicate')) {
        console.error('Error creating influencer profile:', createError)
        return { error: 'Failed to create influencer profile' }
      }
    }
  } else if (profile.role === 'brand') {
    const { data: brandProfile } = await supabase
      .from('brand_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!brandProfile) {
      // Get full name from user_profiles for company name
      const { data: userProfile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      // Create brand profile
      const { error: createError } = await supabase
        .from('brand_profiles')
        .insert({
          user_id: user.id,
          company_name: userProfile?.full_name || 'Company'
        })

      if (createError && !createError.message.includes('duplicate')) {
        console.error('Error creating brand profile:', createError)
        return { error: 'Failed to create brand profile' }
      }
    }
  }

  return { success: true, role: profile.role }
}