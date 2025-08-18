'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestDBPage() {
  const [result, setResult] = useState<any>({})
  const supabase = createClient()

  useEffect(() => {
    testDatabase()
  }, [])

  const testDatabase = async () => {
    try {
      // Test 1: Check if campaign_applications table exists
      const { data: test1, error: error1 } = await supabase
        .from('campaign_applications')
        .select('*')
        .limit(1)

      // Test 2: Get table structure info
      const { data: campaigns, error: campaignsError } = await supabase
        .from('campaigns')
        .select('*')
        .limit(1)

      // Test 3: Check brand_profiles structure
      const { data: brandProfiles, error: brandError } = await supabase
        .from('brand_profiles')
        .select('*')
        .limit(1)

      setResult({
        campaign_applications_test: error1 ? `Error: ${error1.message}` : 'Table exists',
        campaign_applications_data: test1,
        campaigns_test: campaignsError ? `Error: ${campaignsError.message}` : 'Table exists',
        campaigns_data: campaigns,
        brand_profiles_test: brandError ? `Error: ${brandError.message}` : 'Table exists',
        brand_profiles_data: brandProfiles
      })
    } catch (error: any) {
      setResult({ error: error.message })
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(result, null, 2)}
      </pre>
      <button 
        onClick={testDatabase}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh Test
      </button>
    </div>
  )
}