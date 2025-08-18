'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { UserRole } from '@/lib/types/database'

export interface UpdateProfileData {
  userId: string
  fullName: string
  bio: string
  avatarFile?: File | null
  profileData: {
    // Influencer fields
    username?: string
    instagram_handle?: string
    tiktok_handle?: string
    follower_count?: number
    categories?: string[]
    // Brand fields
    company_name?: string
    industry?: string
    website?: string
    location?: string
    description?: string
  }
}

export interface UpdatePasswordData {
  currentPassword: string
  newPassword: string
}

export interface UpdateEmailData {
  newEmail: string
  password: string
}

export async function updateUserProfile(data: UpdateProfileData) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    if (user.id !== data.userId) {
      return { success: false, error: 'Unauthorized' }
    }

    // Update user profile in user_profiles table
    const { error: userUpdateError } = await supabase
      .from('user_profiles')
      .update({
        full_name: data.fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.userId)

    if (userUpdateError) {
      console.error('User update error:', userUpdateError)
      return { success: false, error: 'Failed to update user profile' }
    }

    // Get user role to determine which profile table to update
    const { data: userData, error: userFetchError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', data.userId)
      .single()

    if (userFetchError || !userData) {
      return { success: false, error: 'Failed to get user role' }
    }

    let avatarUrl = null

    // Handle avatar upload if provided
    if (data.avatarFile) {
      const fileExt = data.avatarFile.name.split('.').pop()
      const fileName = `${data.userId}-${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, data.avatarFile, {
          upsert: true
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        // Don't fail the entire update if avatar upload fails
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(uploadData.path)
        
        avatarUrl = publicUrl
      }
    }

    // Update role-specific profile
    if (userData.role === 'influencer') {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('influencer_profiles')
        .select('user_id')
        .eq('user_id', data.userId)
        .single()

      const profileUpdate = {
        bio: data.bio,
        ...(avatarUrl && { avatar_url: avatarUrl }),
        ...(data.profileData.username && { username: data.profileData.username }),
        ...(data.profileData.instagram_handle && { instagram_handle: data.profileData.instagram_handle }),
        ...(data.profileData.tiktok_handle && { tiktok_handle: data.profileData.tiktok_handle }),
        ...(data.profileData.follower_count !== undefined && { follower_count: data.profileData.follower_count }),
        ...(data.profileData.categories && { categories: data.profileData.categories }),
        updated_at: new Date().toISOString()
      }

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('influencer_profiles')
          .update(profileUpdate)
          .eq('user_id', data.userId)

        if (profileError) {
          console.error('Influencer profile update error:', profileError)
          return { success: false, error: 'Failed to update influencer profile' }
        }
      } else {
        // Insert new profile
        const { error: profileError } = await supabase
          .from('influencer_profiles')
          .insert({
            user_id: data.userId,
            ...profileUpdate
          })

        if (profileError) {
          console.error('Influencer profile insert error:', profileError)
          return { success: false, error: 'Failed to create influencer profile' }
        }
      }
    } else if (userData.role === 'brand') {
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('brand_profiles')
        .select('user_id')
        .eq('user_id', data.userId)
        .single()

      const profileUpdate = {
        ...(data.bio && { bio: data.bio }),
        ...(avatarUrl && { avatar_url: avatarUrl }),
        ...(data.profileData.company_name && { company_name: data.profileData.company_name }),
        ...(data.profileData.industry && { industry: data.profileData.industry }),
        ...(data.profileData.website && { website: data.profileData.website }),
        ...(data.profileData.location && { location: data.profileData.location }),
        ...(data.profileData.description && { description: data.profileData.description }),
        updated_at: new Date().toISOString()
      }

      if (existingProfile) {
        // Update existing profile
        const { error: profileError } = await supabase
          .from('brand_profiles')
          .update(profileUpdate)
          .eq('user_id', data.userId)

        if (profileError) {
          console.error('Brand profile update error:', profileError)
          return { success: false, error: 'Failed to update brand profile' }
        }
      } else {
        // Insert new profile
        const { error: profileError } = await supabase
          .from('brand_profiles')
          .insert({
            user_id: data.userId,
            ...profileUpdate
          })

        if (profileError) {
          console.error('Brand profile insert error:', profileError)
          return { success: false, error: 'Failed to create brand profile' }
        }
      }
    }

    revalidatePath('/profile')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Profile update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updatePassword(data: UpdatePasswordData) {
  try {
    const supabase = await createClient()
    
    // Verify current password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data.user?.email || '',
      password: data.currentPassword
    })

    if (verifyError) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: data.newPassword
    })

    if (updateError) {
      console.error('Password update error:', updateError)
      return { success: false, error: 'Failed to update password' }
    }

    return { success: true }
  } catch (error) {
    console.error('Password update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function updateEmailAddress(data: UpdateEmailData) {
  try {
    const supabase = await createClient()
    
    // Verify password by attempting to sign in
    const currentUser = await supabase.auth.getUser()
    if (!currentUser.data.user?.email) {
      return { success: false, error: 'Current email not found' }
    }

    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: currentUser.data.user.email,
      password: data.password
    })

    if (verifyError) {
      return { success: false, error: 'Password is incorrect' }
    }

    // Update email (this will send a confirmation email)
    const { error: updateError } = await supabase.auth.updateUser({
      email: data.newEmail
    })

    if (updateError) {
      console.error('Email update error:', updateError)
      return { success: false, error: 'Failed to update email' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email update error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function deleteUserAccount() {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Delete user data (this will cascade to profile tables due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', user.id)

    if (deleteError) {
      console.error('Account deletion error:', deleteError)
      return { success: false, error: 'Failed to delete account' }
    }

    // Sign out the user
    await supabase.auth.signOut()

    return { success: true }
  } catch (error) {
    console.error('Account deletion error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

export async function getUserProfile(userId: string) {
  try {
    const supabase = await createClient()
    
    // Get user data from user_profiles table
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      console.error('User profile fetch error:', userError)
      return { success: false, error: 'User not found' }
    }

    // Get role-specific profile
    let profile = null
    
    if (user.role === 'influencer') {
      const { data: influencerProfile, error: profileError } = await supabase
        .from('influencer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!profileError) {
        profile = influencerProfile
      }
    } else if (user.role === 'brand') {
      const { data: brandProfile, error: profileError } = await supabase
        .from('brand_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (!profileError) {
        profile = brandProfile
      } else {
        console.error('Brand profile fetch error:', profileError)
      }
    }

    return { 
      success: true, 
      data: { user, profile } 
    }
  } catch (error) {
    console.error('Get user profile error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}