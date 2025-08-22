const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugLinksDisplay() {
  console.log('Debugging content links display issue...\n')
  
  try {
    // Get recent applications
    const { data: applications, error: appsError } = await supabase
      .from('campaign_applications')
      .select('id, influencer_id, campaign_id, created_at, status')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (appsError) {
      console.error('Error fetching applications:', appsError)
      return
    }
    
    console.log(`Found ${applications.length} recent applications\n`)
    
    for (const app of applications) {
      console.log(`\nApplication ${app.id}:`)
      console.log(`  Status: ${app.status}`)
      console.log(`  Created: ${app.created_at}`)
      
      // Get content links for this application
      const { data: links, error: linksError } = await supabase
        .from('application_content_links')
        .select('*')
        .eq('application_id', app.id)
      
      if (linksError) {
        console.error(`  Error fetching links: ${linksError.message}`)
        continue
      }
      
      if (links && links.length > 0) {
        console.log(`  Content Links (${links.length}):`)
        links.forEach(link => {
          console.log(`    - ${link.platform}: ${link.content_url}`)
          console.log(`      Selected: ${link.is_selected}, Status: ${link.selection_status}`)
        })
      } else {
        console.log('  ⚠️  No content links found')
      }
      
      // Check if influencer profile exists
      const { data: influencer } = await supabase
        .from('influencer_profiles')
        .select('id, full_name, username')
        .eq('id', app.influencer_id)
        .single()
      
      if (influencer) {
        console.log(`  Influencer: ${influencer.full_name || influencer.username || 'Unknown'}`)
      } else {
        console.log('  ⚠️  Influencer profile not found')
      }
    }
    
    // Check for orphaned links (links without applications)
    const { data: allLinks } = await supabase
      .from('application_content_links')
      .select('application_id')
      .limit(100)
    
    if (allLinks) {
      const uniqueAppIds = [...new Set(allLinks.map(l => l.application_id))]
      console.log(`\n\nTotal unique applications with links: ${uniqueAppIds.length}`)
      
      // Check if these applications exist
      const { data: existingApps } = await supabase
        .from('campaign_applications')
        .select('id')
        .in('id', uniqueAppIds)
      
      const existingAppIds = new Set(existingApps?.map(a => a.id) || [])
      const orphanedAppIds = uniqueAppIds.filter(id => !existingAppIds.has(id))
      
      if (orphanedAppIds.length > 0) {
        console.log(`⚠️  Found ${orphanedAppIds.length} orphaned application IDs in content_links table`)
      } else {
        console.log('✅ All content links have valid applications')
      }
    }
    
  } catch (error) {
    console.error('Error debugging:', error)
  }
}

debugLinksDisplay()