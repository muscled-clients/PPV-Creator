const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testApplicationLinks() {
  console.log('Testing application links fetching...\n')
  
  try {
    // Get a specific user's applications (modify this user ID as needed)
    const { data: applications } = await supabase
      .from('campaign_applications')
      .select(`
        *,
        campaigns(
          id,
          title,
          description,
          budget_amount,
          brand_id,
          end_date,
          status,
          payment_model,
          cpm_rate
        )
      `)
      .order('created_at', { ascending: false })
      .limit(3)
    
    if (applications && applications.length > 0) {
      console.log(`Found ${applications.length} applications\n`)
      
      const applicationIds = applications.map(app => app.id)
      
      // Fetch content links
      const { data: contentLinks } = await supabase
        .from('application_content_links')
        .select('*')
        .in('application_id', applicationIds)
        .order('created_at', { ascending: true })
      
      console.log(`Found ${contentLinks?.length || 0} total content links\n`)
      
      // Group content links by application
      const linksByApplication = contentLinks?.reduce((acc, link) => {
        if (!acc[link.application_id]) {
          acc[link.application_id] = []
        }
        acc[link.application_id].push(link)
        return acc
      }, {}) || {}
      
      // Merge and display
      const enrichedApplications = applications.map(app => ({
        ...app,
        content_links: linksByApplication[app.id] || []
      }))
      
      enrichedApplications.forEach(app => {
        console.log(`\nApplication ${app.id}:`)
        console.log(`  Status: ${app.status}`)
        console.log(`  Campaign: ${app.campaigns?.title || 'Unknown'}`)
        console.log(`  Content Links: ${app.content_links.length}`)
        if (app.content_links.length > 0) {
          app.content_links.forEach(link => {
            console.log(`    - ${link.platform}: ${link.content_url.substring(0, 50)}...`)
          })
        }
      })
    } else {
      console.log('No applications found')
    }
    
  } catch (error) {
    console.error('Error testing:', error)
  }
}

testApplicationLinks()