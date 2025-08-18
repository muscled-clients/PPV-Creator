import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addTestNotifications() {
  try {
    // Get a brand user
    const { data: brandUsers, error: brandError } = await supabase
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('role', 'brand')
      .limit(1)

    if (brandError) {
      console.error('Error fetching brand users:', brandError)
      return
    }

    if (!brandUsers || brandUsers.length === 0) {
      console.log('No brand users found')
      return
    }

    const brandUser = brandUsers[0]
    console.log(`Adding test notifications for brand user: ${brandUser.email}`)

    // Create test notifications
    const testNotifications = [
      {
        user_id: brandUser.id,
        title: 'New Application Received',
        message: 'Sarah Johnson applied to your "Summer Fashion Campaign"',
        type: 'application_new',
        data: {
          campaign_id: 'test-campaign-1',
          influencer_name: 'Sarah Johnson',
          action_url: '/brand/applications'
        },
        read: false
      },
      {
        user_id: brandUser.id,
        title: 'Campaign Performance Update',
        message: 'Your "Tech Product Review" campaign reached 10,000 impressions',
        type: 'campaign_milestone',
        data: {
          campaign_id: 'test-campaign-2',
          milestone: '10k_impressions',
          action_url: '/brand/campaigns'
        },
        read: false
      },
      {
        user_id: brandUser.id,
        title: 'Payment Processed',
        message: 'Payment of $500 sent to influencer Mike Chen',
        type: 'payment_completed',
        data: {
          amount: 500,
          influencer_name: 'Mike Chen',
          action_url: '/brand/payments'
        },
        read: true
      },
      {
        user_id: brandUser.id,
        title: 'New Content Submission',
        message: 'Alex Kim submitted content for "Beauty Product Launch"',
        type: 'submission_new',
        data: {
          campaign_id: 'test-campaign-3',
          influencer_name: 'Alex Kim',
          action_url: '/brand/submissions'
        },
        read: false
      },
      {
        user_id: brandUser.id,
        title: 'Campaign Ending Soon',
        message: 'Your "Holiday Sale Campaign" ends in 3 days',
        type: 'campaign_reminder',
        data: {
          campaign_id: 'test-campaign-4',
          days_remaining: 3,
          action_url: '/brand/campaigns'
        },
        read: true
      }
    ]

    const { data, error } = await supabase
      .from('notifications')
      .insert(testNotifications)
      .select()

    if (error) {
      console.error('Error inserting notifications:', error)
    } else {
      console.log(`Successfully added ${data?.length || 0} test notifications`)
      console.log('Notification IDs:', data?.map(n => n.id))
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  } finally {
    process.exit(0)
  }
}

addTestNotifications()