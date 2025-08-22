const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testWithdrawal() {
  console.log('Testing withdrawal functionality...\n')
  
  try {
    // Get a pending application
    const { data: applications, error: appsError } = await supabase
      .from('campaign_applications')
      .select('*')
      .eq('status', 'pending')
      .limit(1)
    
    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return
    }
    
    if (!applications || applications.length === 0) {
      console.log('No pending applications found to test withdrawal')
      
      // Show all applications
      const { data: allApps } = await supabase
        .from('campaign_applications')
        .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (allApps && allApps.length > 0) {
        console.log('\nRecent applications:')
        allApps.forEach(app => {
          console.log(`  - ${app.id}: ${app.status} (${new Date(app.created_at).toLocaleDateString()})`)
        })
      }
      return
    }
    
    const application = applications[0]
    console.log(`Found pending application: ${application.id}`)
    console.log(`Influencer ID: ${application.influencer_id}`)
    console.log(`Campaign ID: ${application.campaign_id}`)
    console.log(`Current status: ${application.status}`)
    
    // Test updating to withdrawn
    console.log('\nTesting withdrawal update...')
    const { data: updatedApp, error: updateError } = await supabase
      .from('campaign_applications')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id)
      .select()
      .single()
    
    if (updateError) {
      console.error('❌ Error updating application:', updateError)
    } else {
      console.log('✅ Application updated successfully')
      console.log(`New status: ${updatedApp.status}`)
    }
    
    // Check if application_content_links table exists and update if needed
    const { data: links, error: linksError } = await supabase
      .from('application_content_links')
      .select('*')
      .eq('application_id', application.id)
    
    if (!linksError && links && links.length > 0) {
      console.log(`\nFound ${links.length} content links for this application`)
      
      // Update links status
      const { error: linkUpdateError } = await supabase
        .from('application_content_links')
        .update({
          is_selected: false,
          selection_status: 'not_selected',
          selection_date: new Date().toISOString()
        })
        .eq('application_id', application.id)
      
      if (linkUpdateError) {
        console.error('❌ Error updating content links:', linkUpdateError)
      } else {
        console.log('✅ Content links updated successfully')
      }
    } else if (linksError) {
      console.log('\n⚠️  application_content_links table not accessible (migration may not be applied)')
    } else {
      console.log('\nNo content links found for this application')
    }
    
    // Revert the change for testing
    console.log('\nReverting application back to pending for testing...')
    await supabase
      .from('campaign_applications')
      .update({
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id)
    
    console.log('✅ Application reverted to pending')
    
  } catch (error) {
    console.error('Error during test:', error)
  }
}

testWithdrawal()