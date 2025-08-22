const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('Checking database structure...\n')
  
  try {
    // Check if application_content_links table exists
    const { data: tables, error: tablesError } = await supabase
      .from('application_content_links')
      .select('id')
      .limit(1)
    
    if (tablesError) {
      console.error('❌ Table application_content_links does not exist or is not accessible')
      console.error('Error:', tablesError.message)
      console.log('\n⚠️  Please run the migration: supabase/migrations/20250121_add_multiple_content_links.sql')
      return
    }
    
    console.log('✅ Table application_content_links exists')
    
    // Check for any existing content links
    const { data: contentLinks, error: linksError } = await supabase
      .from('application_content_links')
      .select('*')
      .limit(5)
    
    if (linksError) {
      console.error('Error fetching content links:', linksError)
    } else {
      console.log(`\nFound ${contentLinks?.length || 0} content links in the database`)
      if (contentLinks && contentLinks.length > 0) {
        console.log('\nSample content links:')
        contentLinks.forEach(link => {
          console.log(`  - Application ${link.application_id}: ${link.platform} - ${link.content_url}`)
        })
      }
    }
    
    // Check for recent applications
    const { data: applications, error: appsError } = await supabase
      .from('campaign_applications')
      .select('id, created_at, instagram_content_url, tiktok_content_url')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (!appsError && applications) {
      console.log(`\nFound ${applications.length} recent applications`)
      
      // Check if any have old-style URLs that need migration
      const needsMigration = applications.some(app => 
        (app.instagram_content_url || app.tiktok_content_url)
      )
      
      if (needsMigration) {
        console.log('\n⚠️  Some applications have old-style URLs that may need migration')
        
        // Check if they've been migrated
        for (const app of applications) {
          const { data: links } = await supabase
            .from('application_content_links')
            .select('id')
            .eq('application_id', app.id)
          
          if (links && links.length === 0 && (app.instagram_content_url || app.tiktok_content_url)) {
            console.log(`  - Application ${app.id} has old URLs but no migrated links`)
          }
        }
      }
    }
    
    console.log('\n✅ Database check complete')
    
  } catch (error) {
    console.error('Error checking database:', error)
  }
}

checkDatabase()