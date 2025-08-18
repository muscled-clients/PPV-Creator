'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserRole } from '@/lib/types/database'

export interface SignUpData {
  email: string
  password: string
  fullName: string
  role: UserRole
  username?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface SignInResponse {
  success?: boolean
  error?: string
  redirectPath?: string
  needsConfirmation?: boolean
  email?: string
  isPending?: boolean
  isSuspended?: boolean
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()
  
  try {
    // Step 1: Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    })

    if (authError) {
      console.error('Auth signup error:', authError)
      
      // Handle specific error cases
      if (authError.message.includes('User already registered')) {
        return { error: 'An account with this email already exists' }
      }
      
      return { error: authError.message }
    }

    if (!authData.user) {
      return { error: 'Failed to create account. Please try again.' }
    }

    console.log('Auth user created:', authData.user.id)

    // Step 2: Create user profile record with pending status
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: data.email,
        full_name: data.fullName,
        username: data.username || null,
        role: data.role,
        status: 'pending' // New users start as pending
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the signup if profile creation fails
      // We can create it later on first login
    } else {
      console.log('User profile created successfully')

      // Step 3: Create role-specific profile
      if (data.role === 'influencer') {
        const { error: influencerError } = await supabase
          .from('influencer_profiles')
          .insert({
            user_id: authData.user.id
          })

        if (influencerError) {
          console.error('Influencer profile error (non-fatal):', influencerError)
        } else {
          console.log('Influencer profile created')
        }
      } else if (data.role === 'brand') {
        const { error: brandError } = await supabase
          .from('brand_profiles')
          .insert({
            user_id: authData.user.id,
            company_name: data.fullName
          })

        if (brandError) {
          console.error('Brand profile error (non-fatal):', brandError)
        } else {
          console.log('Brand profile created')
        }
      }
    }

    console.log(`User ${authData.user.email} registered successfully as ${data.role}`)
    
    return { success: true, user: authData.user }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signIn(data: SignInData): Promise<SignInResponse> {
  const supabase = await createClient()
  
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  })

  if (error) {
    console.error('Sign in error:', error)
    
    // Handle specific error cases
    if (error.message === 'Email not confirmed') {
      return { 
        error: 'Please check your email and confirm your account before signing in. Check your spam folder if you haven\'t received the confirmation email.',
        needsConfirmation: true,
        email: data.email
      }
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Invalid email or password' }
    }
    
    return { error: error.message }
  }

  if (!authData.user) {
    return { error: 'Failed to sign in' }
  }

  // Get user profile to determine role and status
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, status')
    .eq('id', authData.user.id)
    .single()

  // Check if user status is active
  if (profile && profile.status !== 'active') {
    // Sign them out immediately
    await supabase.auth.signOut()
    
    if (profile.status === 'pending') {
      return { 
        error: 'Your account is pending approval. Please verify your email or wait for admin approval.',
        isPending: true 
      }
    } else if (profile.status === 'suspended') {
      return { 
        error: 'Your account has been suspended. Please contact support for assistance.',
        isSuspended: true 
      }
    }
  }

  // If no profile exists, create it based on the auth metadata
  if (!profile) {
    console.log('No user profile found, creating one...')
    
    // Get user metadata from auth
    const userMetadata = authData.user.user_metadata
    
    // Create user profile with pending status
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        full_name: userMetadata?.full_name || '',
        role: userMetadata?.role || 'influencer',
        status: 'pending'
      })
    
    if (profileError) {
      console.error('Error creating profile on signin:', profileError)
    }
    
    // Sign them out since they're pending
    await supabase.auth.signOut()
    
    return { 
      error: 'Your account is pending approval. Please verify your email or wait for admin approval.',
      isPending: true 
    }
  }

  // Handle redirect based on role
  let redirectPath = '/influencer/dashboard'
  
  if (profile.role === 'brand') {
    redirectPath = '/brand/dashboard'
  } else if (profile.role === 'admin') {
    redirectPath = '/admin/dashboard'
  } else if (profile.role === 'influencer') {
    redirectPath = '/influencer/dashboard'
  }

  return { success: true, redirectPath }
}

export async function signOut() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.error('Sign out error:', error)
    return { error: error.message }
  }

  return { success: true }
}

export async function getUser() {
  const supabase = await createClient()
  
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    ...user,
    profile
  }
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient()
  
  // First verify current password
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.email) {
    return { error: 'User not found' }
  }

  // Re-authenticate with current password
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword
  })

  if (signInError) {
    return { error: 'Current password is incorrect' }
  }

  // Update password
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function resendConfirmationEmail(email: string) {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email
  })

  if (error) {
    console.error('Error resending confirmation:', error)
    return { error: error.message }
  }

  return { success: true }
}