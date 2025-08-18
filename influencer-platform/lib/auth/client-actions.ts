'use client'

import { createClient } from '@/lib/supabase/client'

export async function clientSignOut() {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Sign out error:', error)
      return { success: false, error: error.message }
    }
    
    // Clear any cached data
    window.location.href = '/'
    return { success: true }
  } catch (error) {
    console.error('Unexpected sign out error:', error)
    return { success: false, error: 'Failed to sign out' }
  }
}