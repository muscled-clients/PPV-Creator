'use client'

import { useState } from 'react'
import { withdrawApplication } from '@/lib/actions/application-actions-enhanced'
import { toast } from 'react-hot-toast'

export default function TestWithdrawalPage() {
  const [applicationId, setApplicationId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    if (!applicationId) {
      toast.error('Please enter an application ID')
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      console.log('[TEST] Testing withdrawal for:', applicationId)
      const result = await withdrawApplication(applicationId)
      console.log('[TEST] Result:', result)
      setResult(result)
      
      if (result.success) {
        toast.success('Application withdrawn successfully!')
      } else {
        toast.error(result.error || 'Failed to withdraw application')
      }
    } catch (error) {
      console.error('[TEST] Error:', error)
      toast.error('An error occurred')
      setResult({ success: false, error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Withdrawal Feature</h1>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="appId" className="block text-sm font-medium text-gray-700 mb-2">
                Application ID to withdraw:
              </label>
              <input
                id="appId"
                type="text"
                value={applicationId}
                onChange={(e) => setApplicationId(e.target.value)}
                placeholder="Enter application ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <button
              onClick={handleTest}
              disabled={isLoading}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Withdrawal'}
            </button>
            
            {result && (
              <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                  Result:
                </h3>
                <pre className={`mt-2 text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open the Network tab in developer tools</li>
              <li>Enter an application ID from your database</li>
              <li>Click "Test Withdrawal"</li>
              <li>Check console logs and network requests</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}