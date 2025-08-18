'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/lib/types/database'

interface UserProfile {
  id: string
  email: string
  username: string | null
  full_name: string | null
  role: UserRole
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

interface AuthUser extends User {
  profile?: UserProfile | null
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError) {
          console.error('Error getting user:', userError)
          setUser(null)
          setLoading(false)
          return
        }
        
        if (user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profileError) {
            console.error('Error getting user profile:', profileError)
            // User exists but profile might not be created yet
            setUser({ ...user, profile: null })
          } else {
            setUser({ ...user, profile })
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          if (session?.user) {
            // Get user profile
            const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileError) {
              console.error('Error getting user profile in auth state change:', profileError)
              setUser({ ...session.user, profile: null })
            } else {
              setUser({ ...session.user, profile })
            }
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error in auth state change:', error)
          setUser(null)
        } finally {
          setLoading(false)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    role: user?.profile?.role,
    isInfluencer: user?.profile?.role === 'influencer',
    isBrand: user?.profile?.role === 'brand',
    isAdmin: user?.profile?.role === 'admin'
  }
}