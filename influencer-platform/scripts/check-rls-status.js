const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkRLSStatus() {
  console.log('Checking RLS status and permissions...\n')
  
  try {
    // Check RLS status
    const { data: tableInfo } = await supabase.rpc('sql', {
      query: `
        SELECT 
          schemaname, 
          tablename, 
          rowsecurity,
          hasindexes,
          hasrules,
          hastriggers
        FROM pg_tables 
        WHERE tablename = 'campaign_applications' 
        AND schemaname = 'public'
      `
    })
    
    console.log('Table Information:')
    if (tableInfo && tableInfo.length > 0) {
      const table = tableInfo[0]
      console.log(`📊 Table: ${table.schemaname}.${table.tablename}`)
      console.log(`🔒 RLS Enabled: ${table.rowsecurity ? 'YES' : 'NO'}`)
      console.log(`🔍 Has Indexes: ${table.hasindexes ? 'YES' : 'NO'}`)
      console.log(`📋 Has Rules: ${table.hasrules ? 'YES' : 'NO'}`)
      console.log(`⚡ Has Triggers: ${table.hastriggers ? 'YES' : 'NO'}`)
    }
    
    // Check table permissions
    const { data: permissions } = await supabase.rpc('sql', {
      query: `
        SELECT 
          grantee,
          privilege_type,
          is_grantable
        FROM information_schema.table_privileges 
        WHERE table_name = 'campaign_applications' 
        AND table_schema = 'public'
        ORDER BY grantee, privilege_type
      `
    })
    
    console.log('\n📝 Table Permissions:')
    if (permissions && permissions.length > 0) {
      permissions.forEach(perm => {
        console.log(`   ${perm.grantee}: ${perm.privilege_type} ${perm.is_grantable === 'YES' ? '(grantable)' : ''}`)
      })
    } else {
      console.log('   No permissions found')
    }
    
    // Test with anon key
    console.log('\n🧪 Testing with anonymous key...')
    const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Try to read applications
    const { data: readTest, error: readError } = await anonSupabase
      .from('campaign_applications')
      .select('id')
      .limit(1)
    
    if (readError) {
      console.log('❌ Anonymous READ failed:', readError.message)
    } else {
      console.log('✅ Anonymous READ works')
      
      // Try to delete (should fail without auth)
      const { error: deleteError } = await anonSupabase
        .from('campaign_applications')
        .delete()
        .eq('id', 'fake-id')
      
      if (deleteError) {
        console.log('❌ Anonymous DELETE failed (expected):', deleteError.message)
      } else {
        console.log('⚠️  Anonymous DELETE works (unexpected!)')
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

checkRLSStatus()