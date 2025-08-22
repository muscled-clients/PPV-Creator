const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Test TikTok integration
async function testTikTokIntegration() {
  console.log('🎵 Testing TikTok Integration...\n')

  // Test 1: Environment variables
  console.log('1. Checking environment variables...')
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TIKTOK_CLIENT_KEY',
    'TIKTOK_CLIENT_SECRET'
  ]

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:')
    missingVars.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log('\n📝 You need to add these to your .env.local file')
  } else {
    console.log('✅ All required environment variables are set')
  }

  // Test 2: Database connection
  console.log('\n2. Testing database connection...')
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data, error } = await supabase
      .from('application_content_links')
      .select('id, platform, content_url')
      .eq('platform', 'tiktok')
      .limit(1)

    if (error) {
      console.log('❌ Database connection failed:', error.message)
    } else {
      console.log('✅ Database connection successful')
      console.log(`   Found ${data?.length || 0} TikTok links in database`)
    }
  } catch (error) {
    console.log('❌ Database connection error:', error.message)
  }

  // Test 3: TikTok URL validation
  console.log('\n3. Testing TikTok URL validation...')
  const testUrls = [
    'https://www.tiktok.com/@markangelcomedy/video/7299127405040422149',
    'https://vm.tiktok.com/ZMhKqV8Af/',
    'https://www.tiktok.com/@username/video/1234567890',
    'https://instagram.com/p/test123/', // Should fail
    'not-a-url' // Should fail
  ]

  for (const url of testUrls) {
    try {
      // Import the validation function
      const { validateSocialMediaLink } = require('../lib/utils/link-validation.ts')
      const result = validateSocialMediaLink(url)
      
      if (result.platform === 'tiktok') {
        console.log(`✅ ${url} -> Valid TikTok URL (ID: ${result.postId})`)
      } else {
        console.log(`❌ ${url} -> ${result.error || 'Not a TikTok URL'}`)
      }
    } catch (error) {
      console.log(`❌ ${url} -> Validation error: ${error.message}`)
    }
  }

  // Test 4: TikTok API Service (if configured)
  console.log('\n4. Testing TikTok API service...')
  
  if (!process.env.TIKTOK_CLIENT_KEY) {
    console.log('⚠️  TikTok API not configured - skipping API tests')
    console.log('   To test API calls, add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET to .env.local')
  } else {
    try {
      // Test with a sample TikTok URL (using oembed which doesn't require auth)
      const testUrl = 'https://www.tiktok.com/@markangelcomedy/video/7299127405040422149'
      
      console.log(`   Testing with URL: ${testUrl}`)
      
      // Test oembed API (public, no auth required)
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(testUrl)}`
      const response = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; InfluencerPlatform/1.0)'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ TikTok oembed API working')
        console.log(`   Title: ${data.title || 'N/A'}`)
        console.log(`   Author: ${data.author_name || 'N/A'}`)
        console.log('   Note: View counts not available via oembed API')
      } else {
        console.log(`❌ TikTok oembed API failed: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.log(`❌ TikTok API test failed: ${error.message}`)
    }
  }

  // Test 5: API endpoints (local server test)
  console.log('\n5. Testing API endpoints...')
  console.log('   To test API endpoints, run your Next.js server and visit:')
  console.log('   GET  http://localhost:3000/api/tiktok/video?url=https://www.tiktok.com/@markangelcomedy/video/7299127405040422149')
  console.log('   GET  http://localhost:3000/api/tiktok/sync-views')
  console.log('   POST http://localhost:3000/api/tiktok/sync-views (with JSON body)')

  // Summary
  console.log('\n📋 Setup Summary:')
  console.log('='.repeat(50))
  
  if (missingVars.length === 0) {
    console.log('✅ Environment variables configured')
  } else {
    console.log('❌ Environment variables need setup')
  }
  
  console.log('📁 Files created:')
  console.log('   - lib/services/tiktok-api-service.ts')
  console.log('   - app/api/tiktok/video/route.ts')
  console.log('   - app/api/tiktok/sync-views/route.ts')
  console.log('   - supabase/migrations/20250122_add_tiktok_metadata.sql')
  console.log('   - lib/services/view-tracking-service.ts (updated)')
  
  console.log('\n🚀 Next Steps:')
  console.log('1. Add TikTok API credentials to .env.local')
  console.log('2. Run the database migration')
  console.log('3. Test the API endpoints')
  console.log('4. Set up periodic sync jobs')
  
  console.log('\n📖 For detailed setup instructions, see the documentation.')
}

// Run the test
testTikTokIntegration().catch(console.error)