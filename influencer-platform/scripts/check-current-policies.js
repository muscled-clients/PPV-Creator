const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkPolicies() {
  console.log('Checking existing RLS policies on campaign_applications...\n')
  
  try {
    const { data: policies } = await supabase.rpc('sql', {
      query: `
        SELECT 
          policyname,
          cmd,
          permissive,
          roles,
          using,
          with_check
        FROM pg_policies 
        WHERE tablename = 'campaign_applications'
        ORDER BY cmd, policyname
      `
    })
    
    if (policies && policies.length > 0) {
      console.log('Existing policies:')
      policies.forEach(policy => {
        console.log(`\n📋 ${policy.policyname}`)
        console.log(`   Command: ${policy.cmd}`)
        console.log(`   Roles: ${policy.roles}`)
        console.log(`   Using: ${policy.using || 'N/A'}`)
        console.log(`   With Check: ${policy.with_check || 'N/A'}`)
        console.log(`   Type: ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`)
      })
      
      // Check specifically for DELETE policies
      const deletePolicies = policies.filter(p => p.cmd === 'DELETE')
      console.log(`\n❗ DELETE policies found: ${deletePolicies.length}`)
      
      if (deletePolicies.length === 0) {
        console.log('🔴 This is the problem! No DELETE policies exist.')
        console.log('Regular users cannot delete applications due to RLS.')
      }
      
    } else {
      console.log('No policies found on campaign_applications table')
    }
    
    // Check if RLS is enabled
    const { data: rlsStatus } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity
        FROM pg_tables 
        WHERE tablename = 'campaign_applications' 
        AND schemaname = 'public'
      `
    })
    
    if (rlsStatus && rlsStatus.length > 0) {
      const table = rlsStatus[0]
      console.log(`\n🔒 RLS Status: ${table.rowsecurity ? 'ENABLED' : 'DISABLED'}`)
      
      if (table.rowsecurity && policies?.filter(p => p.cmd === 'DELETE').length === 0) {
        console.log('🚨 RLS is enabled but no DELETE policy exists!')
        console.log('This prevents users from deleting their applications.')
      }
    }
    
  } catch (error) {
    console.error('Error checking policies:', error)
  }
}

checkPolicies()