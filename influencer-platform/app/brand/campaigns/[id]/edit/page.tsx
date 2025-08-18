import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CampaignEditWrapper } from '@/components/campaigns/campaign-edit-wrapper'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface EditCampaignPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditCampaignPage({ params }: EditCampaignPageProps) {
  // Await params as required in Next.js 15
  const { id } = await params
  
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

  // Get campaign data
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('brand_id', user.id)
    .single()

  if (campaignError || !campaign) {
    redirect('/brand/campaigns')
  }

  // Only allow editing draft campaigns
  if (campaign.status !== 'draft') {
    redirect(`/brand/campaigns/${id}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/brand/campaigns/${id}`}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign Details
          </Link>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
            <p className="text-gray-600 mt-2">
              Update your campaign details before publishing
            </p>
          </div>
        </div>

        {/* Campaign Form wrapper - handles client-side logic */}
        <CampaignEditWrapper 
          initialData={campaign}
          campaignId={id}
        />
      </div>
    </div>
  )
}