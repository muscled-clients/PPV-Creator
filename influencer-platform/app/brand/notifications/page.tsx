import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NotificationsClient } from './notifications-client'

export default async function BrandNotificationsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is a brand
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'brand') {
    redirect('/auth/login')
  }

  // Get notifications with additional data
  const { data: notifications, error: notifError } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Handle error if notifications table doesn't exist
  let enhancedNotifications: any[] = []
  
  if (!notifError && notifications) {
    // Enhanced notifications with proper category mapping
    enhancedNotifications = notifications.map(n => {
      // Determine category based on type
      let category = 'system'
      if (n.type?.includes('application')) category = 'application'
      else if (n.type?.includes('campaign')) category = 'campaign'
      else if (n.type?.includes('payment') || n.type?.includes('payout')) category = 'payment'
      else if (n.type?.includes('message')) category = 'message'
      else if (n.type?.includes('submission')) category = 'campaign'
      
      // Determine action URL based on type
      let action_url = n.data?.action_url
      if (!action_url) {
        if (category === 'application') action_url = '/brand/applications'
        else if (category === 'campaign') action_url = '/brand/campaigns'
        else if (category === 'payment') action_url = '/brand/payments'
      }
      
      return {
        ...n,
        category,
        action_url,
        type: n.type || 'info'
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-2">
                Stay updated with your campaign activities
              </p>
            </div>
          </div>
        </div>

        <NotificationsClient 
          notifications={enhancedNotifications} 
          userId={user.id} 
        />

        {/* Notification Settings */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Notification Settings</h3>
              <p className="text-sm text-gray-600">
                Manage how you receive notifications
              </p>
            </div>
            <Link
              href="/brand/settings#notifications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Manage Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}