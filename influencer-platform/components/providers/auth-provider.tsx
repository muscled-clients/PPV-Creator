'use client'

import { createContext, useContext, useEffect, useState } from 'react'
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

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  role: UserRole | undefined
  isInfluencer: boolean
  isBrand: boolean
  isAdmin: boolean
  refreshSession: () => Promise<boolean>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  role: undefined,
  isInfluencer: false,
  isBrand: false,
  isAdmin: false,
  refreshSession: async () => false,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        setError(null)
        
        // Get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          setError(sessionError.message)
          if (mounted) {
            setUser(null)
            setLoading(false)
          }
          return
        }
        
        if (session?.user) {
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (mounted) {
            if (profileError) {
              console.error('Profile error:', profileError)
              setUser({ ...session.user, profile: null })
            } else {
              setUser({ ...session.user, profile })
            }
          }
        } else {
          if (mounted) {
            setUser(null)
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize auth')
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        
        try {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (mounted) {
              setUser({ ...session.user, profile: profile || null })
            }
          } else {
            if (mounted) {
              setUser(null)
            }
          }
        } catch (err) {
          console.error('Auth state change error:', err)
          if (mounted) {
            setUser(null)
          }
        } finally {
          if (mounted) {
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Refresh session error:', error)
        setError(error.message)
        return false
      }
      return !!session
    } catch (err) {
      console.error('Refresh session error:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
      return false
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        setError(error.message)
      }
    } catch (err) {
      console.error('Sign out error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign out')
    }
  }

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    role: user?.profile?.role,
    isInfluencer: user?.profile?.role === 'influencer',
    isBrand: user?.profile?.role === 'brand',
    isAdmin: user?.profile?.role === 'admin',
    refreshSession,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}