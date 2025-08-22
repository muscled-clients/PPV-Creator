const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugSpecificApplication() {
  const applicationId = 'ebf11b65-e70a-47e5-ba3d-3a903b53b6b8'
  
  console.log(`Debugging application: ${applicationId}\n`)
  
  try {
    // Check if application exists
    const { data: application, error: appError } = await supabase
      .from('campaign_applications')
      .select('*')
      .eq('id', applicationId)
      .single()
    
    if (appError) {
      console.error('Application error:', appError)
      return
    }
    
    console.log('Application found:')
    console.log(`  ID: ${application.id}`)
    console.log(`  Status: ${application.status}`)
    console.log(`  Campaign ID: ${application.campaign_id}`)
    console.log(`  Influencer ID: ${application.influencer_id}`)
    console.log(`  Created: ${application.created_at}`)
    
    // Check for content links
    const { data: contentLinks, error: linksError } = await supabase
      .from('application_content_links')
      .select('*')
      .eq('application_id', applicationId)
    
    if (linksError) {
      console.error('Content links error:', linksError)
      return
    }
    
    console.log(`\nContent links found: ${contentLinks?.length || 0}`)
    if (contentLinks && contentLinks.length > 0) {
      contentLinks.forEach((link, index) => {
        console.log(`  Link ${index + 1}:`)
        console.log(`    ID: ${link.id}`)
        console.log(`    Platform: ${link.platform}`)
        console.log(`    URL: ${link.content_url}`)
        console.log(`    Selected: ${link.is_selected}`)
        console.log(`    Status: ${link.selection_status}`)
        console.log(`    Views: ${link.views_tracked}`)
      })
    } else {
      console.log('  No content links found for this application')
    }
    
    // Check if there are ANY content links in the table
    const { data: allLinks } = await supabase
      .from('application_content_links')
      .select('application_id')
      .limit(10)
    
    console.log(`\nTotal content links in database: ${allLinks?.length || 0}`)
    if (allLinks && allLinks.length > 0) {
      const uniqueAppIds = [...new Set(allLinks.map(l => l.application_id))]
      console.log(`Applications with content links: ${uniqueAppIds.length}`)
      console.log('Sample application IDs with links:', uniqueAppIds.slice(0, 5))
    }
    
  } catch (error) {
    console.error('Error debugging:', error)
  }
}

debugSpecificApplication()