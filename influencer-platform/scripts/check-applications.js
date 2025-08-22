const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role key to bypass RLS
)

async function checkApplications() {
  console.log('Checking campaign applications...\n')

  try {
    // 1. Get all campaigns
    const { data: campaigns, error: campaignsError } = await supabase
      .from('campaigns')
      .select('id, title, status')
      .limit(5)

    if (campaignsError) {
      console.error('Error fetching campaigns:', campaignsError)
      return
    }

    console.log(`Found ${campaigns?.length || 0} campaigns:`)
    campaigns?.forEach(c => {
      console.log(`  - ${c.id}: ${c.title} (${c.status})`)
    })

    // 2. Get all campaign applications
    const { data: applications, error: appsError } = await supabase
      .from('campaign_applications')
      .select('*')

    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return
    }

    console.log(`\nTotal applications in database: ${applications?.length || 0}`)

    // 3. Group by status
    const statusCounts = {}
    applications?.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1
    })

    console.log('\nApplications by status:')
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  - ${status}: ${count}`)
    })

    // 4. Show approved applications details
    const approvedApps = applications?.filter(app => app.status === 'approved') || []
    
    if (approvedApps.length > 0) {
      console.log('\nApproved applications details:')
      for (const app of approvedApps) {
        // Get campaign title
        const { data: campaign } = await supabase
          .from('campaigns')
          .select('title')
          .eq('id', app.campaign_id)
          .single()

        // Get influencer name
        const { data: influencer } = await supabase
          .from('user_profiles')
          .select('full_name, email')
          .eq('id', app.influencer_id)
          .single()

        console.log(`  - Campaign: ${campaign?.title || 'Unknown'}`)
        console.log(`    Influencer: ${influencer?.full_name || 'Unknown'} (${influencer?.email})`)
        console.log(`    Message: ${app.message?.substring(0, 50)}...`)
        console.log('')
      }
    } else {
      console.log('\nNo approved applications found in the database.')
      console.log('To test the showcase feature, you need to:')
      console.log('1. Have at least 2 influencer accounts')
      console.log('2. Apply to the same campaign from both accounts')
      console.log('3. As a brand, approve at least one application')
      console.log('4. Then view the campaign as the other influencer')
    }

    // 5. Check for a specific campaign if provided
    const campaignId = process.argv[2]
    if (campaignId) {
      console.log(`\nChecking applications for campaign ${campaignId}:`)
      
      const { data: campaignApps } = await supabase
        .from('campaign_applications')
        .select('*')
        .eq('campaign_id', campaignId)

      console.log(`Found ${campaignApps?.length || 0} applications for this campaign`)
      campaignApps?.forEach(app => {
        console.log(`  - ${app.influencer_id}: ${app.status}`)
      })
    }

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

checkApplications()
  .then(() => {
    console.log('\nCheck complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })