import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface CampaignDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TestCampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Direct query to campaigns table
  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/influencer/campaigns" className="text-blue-600 mb-4 block">
        ← Back to campaigns
      </Link>
      
      <h1 className="text-2xl font-bold mb-4">Campaign Details Test Page</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-2"><strong>Campaign ID:</strong> {resolvedParams.id}</p>
        <p className="mb-2"><strong>User ID:</strong> {user?.id}</p>
        
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
            <p><strong>Error:</strong></p>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        
        {campaign ? (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">{campaign.title}</h2>
            <p className="text-gray-600 mb-2">{campaign.description}</p>
            <p><strong>Status:</strong> {campaign.status}</p>
            <p><strong>Budget:</strong> ${campaign.budget_amount}</p>
            <p><strong>Start Date:</strong> {new Date(campaign.start_date).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> {new Date(campaign.end_date).toLocaleDateString()}</p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-100 text-yellow-700 rounded">
            <p>No campaign found with ID: {resolvedParams.id}</p>
          </div>
        )}
      </div>
    </div>
  )
}