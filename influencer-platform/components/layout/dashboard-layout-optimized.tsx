import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClientOptimized } from './dashboard-layout-client-optimized'

export async function DashboardLayoutOptimized({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // Only get essential user data server-side
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  let userData = null
  
  if (authUser) {
    // Get only basic user profile - no heavy queries
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('id, email, full_name, username, role, avatar_url')
      .eq('id', authUser.id)
      .single()
    
    if (profile) {
      userData = { ...authUser, ...profile }
    }
  }
  
  // Pass only essential user data to client
  // Notifications and stats will be fetched client-side with caching
  return (
    <DashboardLayoutClientOptimized 
      user={userData}
    >
      {children}
    </DashboardLayoutClientOptimized>
  )
}