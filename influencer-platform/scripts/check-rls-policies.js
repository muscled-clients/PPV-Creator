const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLSPolicies() {
  console.log('Checking RLS policies for campaign_applications...\n')
  
  try {
    // Check RLS policies on campaign_applications table
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('tablename', 'campaign_applications')
    
    if (error) {
      console.error('Error fetching policies:', error)
      return
    }
    
    console.log('Found policies:')
    policies?.forEach(policy => {
      console.log(`- ${policy.policyname}: ${policy.cmd} (${policy.permissive ? 'permissive' : 'restrictive'})`)
      console.log(`  Roles: ${policy.roles}`)
      console.log(`  Using: ${policy.using || 'N/A'}`)
      console.log(`  Check: ${policy.with_check || 'N/A'}`)
      console.log('')
    })
    
    // Check if RLS is enabled
    const { data: tables, error: tableError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'campaign_applications')
    
    if (tableError) {
      console.error('Error checking table:', tableError)
      return
    }
    
    if (tables && tables.length > 0) {
      console.log('RLS Status: Need to check with direct query...')
      
      // Try to get RLS status
      const { data: rlsStatus } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT schemaname, tablename, rowsecurity 
          FROM pg_tables 
          WHERE tablename = 'campaign_applications' 
          AND schemaname = 'public'
        `
      })
      
      console.log('RLS Status query result:', rlsStatus)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkRLSPolicies()