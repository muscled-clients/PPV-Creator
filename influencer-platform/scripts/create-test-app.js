const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createTestApplication() {
  console.log('Creating test application for withdrawal testing...\n')
  
  try {
    // Get an existing campaign
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('id, title')
      .limit(1)
    
    if (!campaigns?.length) {
      console.error('No campaigns found to test with')
      return
    }
    
    const campaign = campaigns[0]
    console.log('Using campaign:', campaign.title, campaign.id)
    
    // Get an influencer user
    const { data: influencers } = await supabase
      .from('user_profiles')
      .select('id, full_name')
      .eq('role', 'influencer')
      .limit(1)
    
    if (!influencers?.length) {
      console.error('No influencer users found')
      return
    }
    
    const influencer = influencers[0]
    console.log('Using influencer:', influencer.full_name, influencer.id)
    
    // Create test application
    const { data: application, error } = await supabase
      .from('campaign_applications')
      .insert({
        campaign_id: campaign.id,
        influencer_id: influencer.id,
        message: 'Test application for withdrawal testing',
        status: 'pending',
        instagram_content_url: 'https://instagram.com/test',
        tiktok_content_url: 'https://tiktok.com/test'
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to create test application:', error)
      return
    }
    
    console.log('\n✅ Test application created successfully!')
    console.log('Application ID:', application.id)
    console.log('Campaign ID:', application.campaign_id)
    console.log('Influencer ID:', application.influencer_id)
    console.log('Status:', application.status)
    
    // Also create some test content links if the table exists
    const { error: checkError } = await supabase
      .from('application_content_links')
      .select('id')
      .limit(1)
    
    if (!checkError) {
      console.log('\nCreating test content links...')
      const { error: linksError } = await supabase
        .from('application_content_links')
        .insert([
          {
            application_id: application.id,
            platform: 'instagram',
            content_url: 'https://instagram.com/test1',
            is_selected: false,
            selection_status: 'pending'
          },
          {
            application_id: application.id,
            platform: 'tiktok',
            content_url: 'https://tiktok.com/test1',
            is_selected: false,
            selection_status: 'pending'
          }
        ])
      
      if (linksError) {
        console.error('Failed to create content links:', linksError)
      } else {
        console.log('✅ Test content links created')
      }
    } else {
      console.log('\n⚠️  application_content_links table not accessible')
    }
    
    return application.id
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createTestApplication()