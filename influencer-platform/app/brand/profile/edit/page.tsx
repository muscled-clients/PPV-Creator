import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileEditWrapper } from './profile-edit-wrapper'

export default async function BrandProfileEditPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is a brand
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'brand') {
    redirect('/auth/login')
  }

  // Get brand profile
  const { data: profile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <ProfileEditWrapper
      user={userData}
      profile={profile}
    />
  )
}