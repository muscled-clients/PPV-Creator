import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfilePageClient } from './profile-client'

export const dynamic = 'force-dynamic'

export default async function InfluencerProfilePage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is an influencer
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'influencer') {
    redirect('/auth/login')
  }

  // Get influencer profile
  const { data: influencerProfile } = await supabase
    .from('influencer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <ProfilePageClient 
      user={userData} 
      profile={influencerProfile}
    />
  )
}