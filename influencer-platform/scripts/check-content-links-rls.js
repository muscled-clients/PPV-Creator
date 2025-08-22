const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkContentLinksRLS() {
  console.log('Checking RLS policies for application_content_links table...\n')
  
  try {
    // Check if RLS is enabled on the table
    const { data: tableInfo, error: tableError } = await supabase
      .from('pg_tables')
      .select('*')
      .eq('tablename', 'application_content_links')
    
    if (tableError) {
      console.error('Error checking table:', tableError)
    } else {
      console.log('Table exists:', tableInfo?.length > 0)
    }
    
    // Check RLS policies using SQL query
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_table_policies', { table_name: 'application_content_links' })
    
    if (policiesError) {
      console.log('Custom RPC not available, trying direct SQL...')
      
      // Try a different approach to check policies
      const { data: rlsStatus, error: rlsError } = await supabase
        .from('pg_class')
        .select('relname, relrowsecurity')
        .eq('relname', 'application_content_links')
      
      if (rlsError) {
        console.error('Error checking RLS status:', rlsError)
      } else {
        console.log('RLS status:', rlsStatus)
      }
    } else {
      console.log('RLS Policies:', policies)
    }
    
    // Test access with different contexts
    console.log('\nTesting access patterns...')
    
    // Test 1: Service client (should bypass RLS)
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey)
    const { data: serviceData, error: serviceError } = await serviceSupabase
      .from('application_content_links')
      .select('id, application_id')
      .limit(1)
    
    console.log('Service client access:', serviceData?.length || 0, 'records')
    if (serviceError) {
      console.error('Service client error:', serviceError)
    }
    
    // Test 2: Anonymous client
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    const { data: anonData, error: anonError } = await anonSupabase
      .from('application_content_links')
      .select('id, application_id')
      .limit(1)
    
    console.log('Anonymous client access:', anonData?.length || 0, 'records')
    if (anonError) {
      console.error('Anonymous client error:', anonError)
    }
    
  } catch (error) {
    console.error('Error checking RLS:', error)
  }
}

checkContentLinksRLS()