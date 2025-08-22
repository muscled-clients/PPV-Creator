const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Simulate the withdrawApplication function logic
async function testWithdrawApplication(applicationId) {
  try {
    console.log('[TEST] Starting withdrawal for:', applicationId)
    
    // Get application to verify ownership (using service role for testing)
    const { data: application, error: applicationError } = await supabase
      .from('campaign_applications')
      .select('*, campaigns(title)')
      .eq('id', applicationId)
      .single()

    console.log('[TEST] Application check:', application?.id, applicationError?.message)
    if (applicationError || !application) {
      return { success: false, error: 'Application not found' }
    }

    console.log('[TEST] Application details:')
    console.log('- ID:', application.id)
    console.log('- Status:', application.status)
    console.log('- Influencer ID:', application.influencer_id)
    console.log('- Campaign:', application.campaigns?.title)

    // Check if application is in a withdrawable state
    console.log('[TEST] Status check:', application.status)
    if (application.status === 'approved') {
      return { success: false, error: 'Cannot withdraw an approved application' }
    }

    // Delete content links first (if table exists)
    console.log('[TEST] Checking for content links...')
    const { data: existingLinks, error: checkError } = await supabase
      .from('application_content_links')
      .select('*')
      .eq('application_id', applicationId)
    
    if (checkError) {
      console.log('[TEST] Content links table not accessible:', checkError.message)
    } else {
      console.log(`[TEST] Found ${existingLinks?.length || 0} content links`)
      
      if (existingLinks && existingLinks.length > 0) {
        console.log('[TEST] Deleting content links...')
        const { error: deleteLinksError } = await supabase
          .from('application_content_links')
          .delete()
          .eq('application_id', applicationId)
        
        if (deleteLinksError) {
          console.error('[TEST] Error deleting content links:', deleteLinksError)
          return { success: false, error: 'Failed to delete content links: ' + deleteLinksError.message }
        } else {
          console.log('[TEST] Content links deleted successfully')
        }
      }
    }

    // Check for RLS policies that might prevent deletion
    console.log('[TEST] Checking RLS policies...')
    const { data: policies } = await supabase.rpc('sql', {
      query: `
        SELECT policyname, cmd, using 
        FROM pg_policies 
        WHERE tablename = 'campaign_applications' 
        AND cmd = 'DELETE'
      `
    })
    
    if (policies && policies.length > 0) {
      console.log('[TEST] Found DELETE policies:')
      policies.forEach(policy => {
        console.log(`  - ${policy.policyname}: ${policy.using}`)
      })
    } else {
      console.log('[TEST] ⚠️  No DELETE policies found - this might prevent user deletions')
    }

    // Delete the application
    console.log('[TEST] Attempting to delete application...')
    const { data: deletedApp, error: deleteError } = await supabase
      .from('campaign_applications')
      .delete()
      .eq('id', applicationId)
      .select()

    if (deleteError) {
      console.error('[TEST] Failed to delete application:', deleteError)
      return { success: false, error: 'Failed to withdraw application: ' + deleteError.message }
    }
    
    console.log('[TEST] Application deleted successfully!')
    console.log('[TEST] Deleted records:', deletedApp?.length || 0)

    return { 
      success: true, 
      message: `Application for "${application.campaigns?.title}" has been withdrawn. You can now apply again if needed.`
    }
  } catch (error) {
    console.error('[TEST] Error during withdrawal:', error)
    return { success: false, error: 'An unexpected error occurred: ' + error.message }
  }
}

// Test with the created application
const testAppId = '10ccb0b4-d8bb-4a09-8af2-f2c23d653536' // From previous script
testWithdrawApplication(testAppId).then(result => {
  console.log('\n=== FINAL RESULT ===')
  console.log(JSON.stringify(result, null, 2))
})