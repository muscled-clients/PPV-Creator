require('dotenv').config({ path: '.env.local' })

async function testTikTokCredentials() {
  console.log('🔑 Testing TikTok Developer Credentials...\n')

  // Check if credentials are set
  const clientKey = process.env.TIKTOK_CLIENT_KEY
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET

  if (!clientKey || !clientSecret) {
    console.log('❌ Missing TikTok credentials in .env.local')
    console.log('   Add these lines to your .env.local file:')
    console.log('   TIKTOK_CLIENT_KEY=your_client_key_here')
    console.log('   TIKTOK_CLIENT_SECRET=your_client_secret_here')
    return
  }

  console.log('✅ Credentials found in environment')
  console.log(`   Client Key: ${clientKey.substring(0, 8)}...`)
  console.log(`   Client Secret: ${clientSecret.substring(0, 8)}...`)

  // Test 1: Get Access Token (Client Credentials Flow)
  console.log('\n🔐 Testing Client Credentials Flow...')
  try {
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'client_credentials'
      })
    })

    const tokenData = await tokenResponse.json()
    
    if (tokenData.access_token) {
      console.log('✅ Successfully obtained access token')
      console.log(`   Token: ${tokenData.access_token.substring(0, 20)}...`)
      console.log(`   Expires in: ${tokenData.expires_in} seconds`)
      
      // Test 2: Make a test API call
      console.log('\n📊 Testing API Call...')
      const testResponse = await fetch('https://open-api.tiktok.com/research/video/query/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            and: [
              {
                operation: 'EQ',
                field_name: 'region_code',
                field_values: ['US']
              }
            ]
          },
          fields: ['id', 'video_description'],
          max_count: 1
        })
      })

      const testData = await testResponse.json()
      
      if (testData.error) {
        if (testData.error.code === 'access_denied') {
          console.log('⚠️  Research API access not approved yet')
          console.log('   This is normal for new apps')
          console.log('   Apply for Research API access in your TikTok Developer Dashboard')
        } else {
          console.log('❌ API Error:', testData.error.message)
        }
      } else {
        console.log('✅ Research API access is working!')
        console.log('   You can fetch TikTok analytics data')
      }
    } else {
      console.log('❌ Failed to get access token')
      console.log('   Error:', tokenData.error_description || tokenData.message)
      console.log('\n🔧 Troubleshooting:')
      console.log('   1. Check your Client Key and Client Secret are correct')
      console.log('   2. Ensure your TikTok app is approved and active')
      console.log('   3. Verify your app has the correct permissions')
    }
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }

  // Test 3: Test Oembed API (always available)
  console.log('\n🌐 Testing Oembed API (Public)...')
  try {
    const oembedUrl = 'https://www.tiktok.com/oembed?url=https://www.tiktok.com/@markangelcomedy/video/7299127405040422149'
    const oembedResponse = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InfluencerPlatform/1.0)'
      }
    })

    if (oembedResponse.ok) {
      const oembedData = await oembedResponse.json()
      console.log('✅ Oembed API working')
      console.log(`   Title: ${oembedData.title || 'N/A'}`)
      console.log(`   Author: ${oembedData.author_name || 'N/A'}`)
      console.log('   Note: Oembed provides basic info but not view counts')
    } else {
      console.log('❌ Oembed API failed')
    }
  } catch (error) {
    console.log('❌ Oembed test failed:', error.message)
  }

  // Summary
  console.log('\n📋 Summary:')
  console.log('=' * 50)
  console.log('✅ Basic setup complete')
  console.log('📝 Next steps:')
  console.log('   1. Apply for Research API access for view counts')
  console.log('   2. Test your app endpoints')
  console.log('   3. Set up periodic sync jobs')
}

testTikTokCredentials().catch(console.error)