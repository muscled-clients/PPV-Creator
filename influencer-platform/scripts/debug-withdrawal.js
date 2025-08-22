const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

// Create clients
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey)
const userSupabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugWithdrawal() {
  console.log('=== Debugging Withdrawal Issue ===\n')
  
  try {
    // 1. Find an application to test with
    console.log('1. Finding a test application...')
    const { data: applications, error: appsError } = await adminSupabase
      .from('campaign_applications')
      .select('*')
      .eq('status', 'pending')
      .limit(1)
    
    if (appsError || !applications?.length) {
      console.error('No test applications found:', appsError)
      return
    }
    
    const testApp = applications[0]
    console.log(`Found test application: ${testApp.id}`)
    console.log(`Influencer ID: ${testApp.influencer_id}`)
    console.log(`Status: ${testApp.status}`)
    
    // 2. Check RLS policies on campaign_applications
    console.log('\n2. Checking RLS policies...')
    const { data: rlsCheck } = await adminSupabase.rpc('sql', {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity,
          (SELECT array_agg(policyname) FROM pg_policies WHERE tablename = 'campaign_applications') as policies
        FROM pg_tables 
        WHERE tablename = 'campaign_applications' 
        AND schemaname = 'public'
      `
    }).single()
    
    console.log('RLS Info:', rlsCheck)
    
    // 3. Try to simulate user authentication and deletion
    console.log('\n3. Testing user permissions...')
    
    // First, check if we can read the application as the user
    const { error: authError } = await userSupabase.auth.signInWithPassword({
      email: 'test@example.com', // This won't work, but let's see the error
      password: 'password'
    })
    
    if (authError) {
      console.log('Expected auth error (no real user):', authError.message)
    }
    
    // 4. Test direct deletion with service role
    console.log('\n4. Testing direct deletion with service role...')
    const { data: deleteResult, error: deleteError } = await adminSupabase
      .from('campaign_applications')
      .delete()
      .eq('id', testApp.id)
      .select()
    
    if (deleteError) {
      console.error('❌ Delete failed:', deleteError)
    } else {
      console.log('✅ Delete successful with service role!')
      console.log('Deleted records:', deleteResult?.length)
      
      // Restore the application for further testing
      const { error: insertError } = await adminSupabase
        .from('campaign_applications')
        .insert(testApp)
      
      if (insertError) {
        console.error('Failed to restore test application:', insertError)
      } else {
        console.log('✅ Test application restored')
      }
    }
    
    // 5. Check what RLS policies exist for DELETE
    console.log('\n5. Checking DELETE policies specifically...')
    const { data: deletePolicies } = await adminSupabase.rpc('sql', {
      query: `
        SELECT policyname, cmd, permissive, roles, using, with_check
        FROM pg_policies 
        WHERE tablename = 'campaign_applications' 
        AND cmd = 'DELETE'
      `
    })
    
    console.log('DELETE Policies:')
    if (deletePolicies && deletePolicies.length > 0) {
      deletePolicies.forEach(policy => {
        console.log(`- ${policy.policyname}: ${policy.using}`)
      })
    } else {
      console.log('⚠️  No DELETE policies found! This might be the issue.')
    }
    
    // 6. Check if there are any DELETE policies at all
    console.log('\n6. All policies on campaign_applications:')
    const { data: allPolicies } = await adminSupabase.rpc('sql', {
      query: `
        SELECT policyname, cmd, permissive, roles, using, with_check
        FROM pg_policies 
        WHERE tablename = 'campaign_applications'
      `
    })
    
    if (allPolicies) {
      allPolicies.forEach(policy => {
        console.log(`- ${policy.policyname} (${policy.cmd}): ${policy.using || policy.with_check || 'No condition'}`)
      })
    }
    
  } catch (error) {
    console.error('Error during debug:', error)
  }
}

debugWithdrawal()