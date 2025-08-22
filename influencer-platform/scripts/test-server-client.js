// Test the exact same logic as the server action but with logging
const { createClient: createServerClient } = require('@supabase/ssr')
const { cookies } = require('next/headers')

// Simulate server-side createClient
async function testServerSideLogic() {
  console.log('Testing server-side client logic...\n')
  
  try {
    // This is what happens in lib/supabase/server.ts
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name) {
            // In real server context, this would get actual cookies
            console.log(`[COOKIES] Attempting to get cookie: ${name}`)
            return null // No cookies in test environment
          }
        }
      }
    )
    
    console.log('📡 Server client created')
    
    // Test getting user (should fail without cookies)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('👤 User check:')
    console.log('   User:', user?.id || 'null')
    console.log('   Error:', authError?.message || 'none')
    
    if (!user) {
      console.log('\n🔴 FOUND THE ISSUE!')
      console.log('The server action cannot get the authenticated user.')
      console.log('This is because we\'re testing outside of a Next.js request context.')
      console.log('In the real app, cookies would contain the auth session.')
      
      return
    }
    
    // If we had a user, we'd continue with the deletion logic
    
  } catch (error) {
    console.error('Error:', error)
  }
}

// Simple test to understand the issue
console.log('=== Understanding the Server Action Issue ===\n')

console.log('💡 The issue is likely one of these:')
console.log('1. Authentication session not passed correctly to server action')
console.log('2. User not logged in when testing')
console.log('3. Cookie/session issue in the browser')
console.log('4. RLS policy blocking the operation')

console.log('\n🔧 To debug in the actual app:')
console.log('1. Open browser dev tools')
console.log('2. Go to /test-withdrawal page (we created it)')
console.log('3. Make sure you\'re logged in as an influencer')
console.log('4. Enter an application ID owned by that influencer')
console.log('5. Click "Test Withdrawal"')
console.log('6. Check console logs and network requests')

console.log('\n🎯 Most likely fix needed:')
console.log('- Ensure user is properly authenticated')
console.log('- Or add proper RLS policies for DELETE operations')

testServerSideLogic()