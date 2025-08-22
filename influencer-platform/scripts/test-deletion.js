const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testDeletion() {
  console.log('Testing application deletion...\n')
  
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
      console.log('No pending applications found to test deletion')
      return
    }
    
    const application = applications[0]
    console.log(`Found application to test: ${application.id}`)
    console.log(`Status: ${application.status}`)
    console.log(`Campaign: ${application.campaign_id}`)
    console.log(`Influencer: ${application.influencer_id}`)
    
    // Check if content links exist
    const { data: links, error: linksError } = await supabase
      .from('application_content_links')
      .select('*')
      .eq('application_id', application.id)
    
    if (linksError) {
      console.log('\n⚠️  application_content_links table not accessible:', linksError.message)
    } else {
      console.log(`\nFound ${links?.length || 0} content links for this application`)
    }
    
    // Test deletion of content links first (if they exist)
    if (!linksError && links && links.length > 0) {
      console.log('\nDeleting content links...')
      const { error: deleteLinksError } = await supabase
        .from('application_content_links')
        .delete()
        .eq('application_id', application.id)
      
      if (deleteLinksError) {
        console.error('❌ Error deleting content links:', deleteLinksError)
        return
      } else {
        console.log('✅ Content links deleted successfully')
      }
    }
    
    // Test deletion of application
    console.log('\nDeleting application...')
    const { data: deletedApp, error: deleteError } = await supabase
      .from('campaign_applications')
      .delete()
      .eq('id', application.id)
      .select()
    
    if (deleteError) {
      console.error('❌ Error deleting application:', deleteError)
    } else {
      console.log('✅ Application deleted successfully!')
      console.log('Deleted records:', deletedApp?.length || 0)
    }
    
    // Verify deletion
    console.log('\nVerifying deletion...')
    const { data: checkApp, error: checkError } = await supabase
      .from('campaign_applications')
      .select('*')
      .eq('id', application.id)
    
    if (checkError) {
      console.error('Error checking deletion:', checkError)
    } else if (!checkApp || checkApp.length === 0) {
      console.log('✅ Verified: Application successfully deleted from database')
    } else {
      console.log('❌ Application still exists in database!')
      console.log('Found:', checkApp)
    }
    
  } catch (error) {
    console.error('Error during test:', error)
  }
}

testDeletion()