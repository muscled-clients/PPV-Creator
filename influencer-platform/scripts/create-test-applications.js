const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role key to bypass RLS
)

async function createTestApplications() {
  const campaignId = process.argv[2]
  
  if (!campaignId) {
    console.error('Please provide a campaign ID as an argument')
    console.log('Usage: node scripts/create-test-applications.js <campaign-id>')
    
    // Show available campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title, status')
      .eq('status', 'active')
      .limit(5)
    
    console.log('\nAvailable active campaigns:')
    campaigns?.forEach(c => {
      console.log(`  ${c.id} - ${c.title}`)
    })
    
    return
  }

  console.log(`Creating test applications for campaign: ${campaignId}\n`)

  try {
    // First, create test influencer accounts if they don't exist
    const testInfluencers = [
      {
        email: 'test.influencer1@example.com',
        full_name: 'Sarah Johnson',
        username: 'sarahjohnson',
        bio: 'Fashion and lifestyle influencer with 50K followers'
      },
      {
        email: 'test.influencer2@example.com',
        full_name: 'Mike Chen',
        username: 'mikechen',
        bio: 'Tech and gaming content creator'
      },
      {
        email: 'test.influencer3@example.com',
        full_name: 'Emma Wilson',
        username: 'emmawilson',
        bio: 'Beauty and wellness influencer'
      }
    ]

    const createdInfluencers = []

    for (const influencer of testInfluencers) {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', influencer.email)
        .single()

      if (existingUser) {
        console.log(`User ${influencer.full_name} already exists`)
        createdInfluencers.push(existingUser.id)
      } else {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: influencer.email,
          password: 'TestPassword123!',
          email_confirm: true
        })

        if (authError) {
          console.error(`Error creating auth user for ${influencer.email}:`, authError)
          continue
        }

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: influencer.email,
            full_name: influencer.full_name,
            username: influencer.username,
            role: 'influencer',
            status: 'active'
          })

        if (profileError) {
          console.error(`Error creating profile for ${influencer.email}:`, profileError)
          continue
        }

        // Create influencer profile
        await supabase
          .from('influencer_profiles')
          .insert({
            user_id: authData.user.id,
            bio: influencer.bio
          })

        console.log(`Created test influencer: ${influencer.full_name}`)
        createdInfluencers.push(authData.user.id)
      }
    }

    // Create applications for the test influencers
    const applicationMessages = [
      "I'm excited to collaborate on this campaign! My audience perfectly aligns with your target demographic, and I have experience creating engaging content that drives real results.",
      "As a content creator with 5 years of experience, I believe I can bring unique value to your campaign. My engagement rate is consistently above 8%, and I pride myself on authentic storytelling.",
      "Your campaign resonates with my personal brand values. I've successfully worked with similar brands and achieved an average of 100K+ views per sponsored post."
    ]

    for (let i = 0; i < createdInfluencers.length && i < 2; i++) { // Create 2 approved applications
      const influencerId = createdInfluencers[i]
      
      // Check if application already exists
      const { data: existingApp } = await supabase
        .from('campaign_applications')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('influencer_id', influencerId)
        .single()

      if (existingApp) {
        // Update existing application to approved
        const { error: updateError } = await supabase
          .from('campaign_applications')
          .update({ 
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingApp.id)

        if (!updateError) {
          console.log(`Updated existing application to approved for influencer ${i + 1}`)
        }
      } else {
        // Create new application
        const { data: newApp, error: appError } = await supabase
          .from('campaign_applications')
          .insert({
            campaign_id: campaignId,
            influencer_id: influencerId,
            message: applicationMessages[i],
            status: 'approved',
            proposed_rate: 50 + (i * 10),
            deliverables: '3 Instagram posts, 2 stories'
          })
          .select()
          .single()

        if (appError) {
          console.error(`Error creating application:`, appError)
        } else {
          console.log(`Created approved application for test influencer ${i + 1}`)

          // Add sample content links
          const links = [
            {
              application_id: newApp.id,
              platform: 'instagram',
              content_url: `https://instagram.com/p/sample${i+1}_post1`,
              is_selected: true,
              selection_status: 'selected',
              views_tracked: 15000 + (i * 5000)
            },
            {
              application_id: newApp.id,
              platform: 'tiktok',
              content_url: `https://tiktok.com/@user/video/sample${i+1}`,
              is_selected: true,
              selection_status: 'selected',
              views_tracked: 25000 + (i * 10000)
            }
          ]

          const { error: linksError } = await supabase
            .from('application_content_links')
            .insert(links)

          if (!linksError) {
            console.log(`  Added content links with view data`)
          }
        }
      }
    }

    console.log('\n✅ Test data created successfully!')
    console.log('Now when you view this campaign as an influencer (not one of the test accounts),')
    console.log('you should see the approved applications showcase.')

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createTestApplications()
  .then(() => {
    process.exit(0)
  })
  .catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })