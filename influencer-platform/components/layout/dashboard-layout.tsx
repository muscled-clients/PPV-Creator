import { createClient } from '@/lib/supabase/server'
import { DashboardLayoutClient } from './dashboard-layout-client'

export async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // Get user data server-side
  const { data: { user: authUser } } = await supabase.auth.getUser()
  
  let userData = null
  let notifications = []
  let stats = {}
  
  if (authUser) {
    // Get user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    if (profile) {
      userData = { ...authUser, ...profile }
      
      // Get notifications
      const { data: notificationData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5)
      
      notifications = notificationData || []
      
      // Get stats based on role
      if (profile.role === 'brand') {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, status')
          .eq('brand_id', authUser.id)
        
        const { data: applications } = await supabase
          .from('campaign_applications')
          .select('id, campaigns!inner(brand_id)')
          .eq('campaigns.brand_id', authUser.id)
          .eq('status', 'pending')

        stats = {
          activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
          pendingApplications: applications?.length || 0
        }
      } else if (profile.role === 'influencer') {
        const { data: applications } = await supabase
          .from('campaign_applications')
          .select('id, status')
          .eq('influencer_id', authUser.id)

        const { data: submissions } = await supabase
          .from('submissions')
          .select('id, status')
          .eq('influencer_id', authUser.id)
          .eq('status', 'pending_review')

        stats = {
          activeApplications: applications?.filter(a => a.status === 'approved').length || 0,
          pendingSubmissions: submissions?.length || 0
        }
      } else if (profile.role === 'admin') {
        // Admin stats
        const { data: totalUsers } = await supabase
          .from('user_profiles')
          .select('id')
          .neq('role', 'admin')
        
        const { data: activeCampaigns } = await supabase
          .from('campaigns')
          .select('id')
          .eq('status', 'active')

        stats = {
          totalUsers: totalUsers?.length || 0,
          activeCampaigns: activeCampaigns?.length || 0
        }
      }
    }
  }
  
  return (
    <DashboardLayoutClient 
      user={userData}
      notifications={notifications}
      stats={stats}
    >
      {children}
    </DashboardLayoutClient>
  )
}