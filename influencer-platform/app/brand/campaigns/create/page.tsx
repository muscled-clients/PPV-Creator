import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CampaignForm } from '@/components/campaigns/campaign-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CreateCampaignPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is a brand
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'brand') {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/brand/campaigns"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Campaign</h1>
            <p className="text-gray-600 mt-2">
              Launch a new influencer marketing campaign to reach your target audience
            </p>
          </div>
        </div>

        {/* Campaign Form */}
        <CampaignForm mode="create" />
      </div>
    </div>
  )
}