import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CampaignDetailActions } from '@/components/campaigns/campaign-detail-actions'
import { ArrowLeft, Calendar, DollarSign, Target, Users, Eye } from 'lucide-react'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CampaignDetailPage({ params }: PageProps) {
  // Await params as required in Next.js 15
  const { id } = await params
  
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get campaign directly
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .single()

  if (campaignError || !campaign) {
    console.error('Campaign fetch error:', campaignError)
    redirect('/brand/campaigns')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link
          href="/brand/campaigns"
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>
        
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {campaign.title}
            </h1>
            <span className={`inline-block mt-2 px-3 py-1 text-sm font-medium rounded-full ${
              campaign.status === 'active' 
                ? 'bg-green-100 text-green-800'
                : campaign.status === 'draft'
                ? 'bg-yellow-100 text-yellow-800'
                : campaign.status === 'completed'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {campaign.status}
            </span>
          </div>
          <CampaignDetailActions campaign={campaign} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Campaign Overview</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600">{campaign.description}</p>
                </div>
                
                {campaign.requirements && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Requirements</h3>
                    <p className="text-gray-600">{campaign.requirements}</p>
                  </div>
                )}
                
                {campaign.deliverables && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Deliverables</h3>
                    <p className="text-gray-600">{campaign.deliverables}</p>
                  </div>
                )}
                
                {campaign.target_audience && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Target Audience</h3>
                    <p className="text-gray-600">{campaign.target_audience}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">CPM Rate</span>
                  </div>
                  <span className="font-semibold">1K/${campaign.cpm_rate || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Max Views</span>
                  </div>
                  <span className="font-semibold">{((campaign.max_views || 0) / 1000).toFixed(0)}K</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Max Budget</span>
                  </div>
                  <span className="font-semibold">${campaign.total_budget_calculated || campaign.budget_amount}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Start Date</span>
                  </div>
                  <span className="text-sm">{new Date(campaign.start_date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">End Date</span>
                  </div>
                  <span className="text-sm">{new Date(campaign.end_date).toLocaleDateString()}</span>
                </div>
                
                {campaign.slots_available && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Slots</span>
                    </div>
                    <span className="text-sm">{campaign.slots_filled || 0}/{campaign.slots_available}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Platforms & Categories */}
            {(campaign.platforms?.length > 0 || campaign.categories?.length > 0) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Targeting</h3>
                
                {campaign.platforms?.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.platforms.map((platform: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {campaign.categories?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {campaign.categories.map((category: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm capitalize">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {campaign.status === 'draft' && (
                  <Link
                    href={`/brand/campaigns/${id}/edit`}
                    className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Edit Campaign
                  </Link>
                )}
                <Link
                  href="/brand/campaigns"
                  className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Back to Campaigns
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}