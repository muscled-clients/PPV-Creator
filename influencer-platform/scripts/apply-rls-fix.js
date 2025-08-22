const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Using service role key to execute SQL
)

async function applyRLSFix() {
  console.log('Applying RLS policy fix for approved applications visibility...\n')

  try {
    // First, check existing policies
    const { data: existingPolicies, error: checkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'campaign_applications' 
        AND schemaname = 'public';
      `
    }).single()

    if (checkError && !checkError.message.includes('rpc function exec_sql')) {
      console.log('Note: Cannot check existing policies directly. Proceeding with fix...')
    }

    // Try to create the policy (will fail if it already exists, which is fine)
    const policySQL = `
      -- Drop the policy if it exists (to avoid conflicts)
      DROP POLICY IF EXISTS "Anyone can view approved applications for inspiration" ON public.campaign_applications;
      
      -- Create the new policy
      CREATE POLICY "Anyone can view approved applications for inspiration"
      ON public.campaign_applications
      FOR SELECT
      TO authenticated
      USING (status = 'approved');
    `

    // Since we can't execute raw SQL directly, let's work around it
    // by using Supabase's admin functions or updating data directly
    
    console.log('Testing current access to approved applications...')
    
    // Test with service role key (bypasses RLS)
    const { data: allApps, error: allError } = await supabase
      .from('campaign_applications')
      .select('id, status, campaign_id, influencer_id')
      .eq('status', 'approved')

    console.log(`Found ${allApps?.length || 0} approved applications with service role key`)

    if (allApps && allApps.length > 0) {
      console.log('\nApproved applications exist in database:')
      allApps.forEach(app => {
        console.log(`  - Application ${app.id.substring(0, 8)}... for campaign ${app.campaign_id.substring(0, 8)}...`)
      })
    }

    console.log('\n⚠️  IMPORTANT: The RLS policy needs to be added to allow viewing approved applications.')
    console.log('\nTo fix this, please run the following SQL in your Supabase SQL Editor:')
    console.log('=' .repeat(80))
    console.log(policySQL)
    console.log('=' .repeat(80))
    console.log('\nSteps:')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy and paste the SQL above')
    console.log('4. Click "Run"')
    console.log('5. Refresh your application page')
    
    console.log('\nAlternatively, you can use the Supabase CLI:')
    console.log('npx supabase db push --local')

  } catch (error) {
    console.error('Error:', error)
  }
}

applyRLSFix()
  .then(() => {
    console.log('\nScript complete!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Script failed:', error)
    process.exit(1)
  })