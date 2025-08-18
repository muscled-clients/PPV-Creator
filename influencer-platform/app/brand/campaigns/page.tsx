import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCampaigns } from '@/lib/actions/campaign-actions'
import { CampaignCardClient } from '@/components/campaigns/campaign-card-client'
import { 
  Plus,
  BarChart3,
  Target,
  Users,
  DollarSign,
  Clock,
  CheckCircle
} from 'lucide-react'

export default async function BrandCampaignsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is a brand
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'brand') {
    redirect('/auth/login')
  }

  // Get campaigns
  const result = await getCampaigns({}, 'brand', user.id)
  const campaigns = result.success ? result.data : []

  // Calculate stats
  const totalCampaigns = campaigns.length
  const activeCampaigns = campaigns.filter((c: any) => c.status === 'active').length
  const draftCampaigns = campaigns.filter((c: any) => c.status === 'draft').length
  const completedCampaigns = campaigns.filter((c: any) => c.status === 'completed').length
  const totalBudget = campaigns.reduce((sum: number, c: any) => sum + (c.budget_amount || 0), 0)
  const totalApplications = campaigns.reduce((sum: number, c: any) => sum + (c.campaign_applications?.length || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Campaigns 🚀
            </h1>
            <p className="text-gray-600">
              Manage your influencer marketing campaigns
            </p>
          </div>
          <Link
            href="/brand/campaigns/create"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span>Create Campaign</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{totalCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active</p>
                <p className="text-xl font-bold text-gray-900">{activeCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Draft</p>
                <p className="text-xl font-bold text-gray-900">{draftCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Budget</p>
                <p className="text-lg font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Applications</p>
                <p className="text-xl font-bold text-gray-900">{totalApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-pink-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-pink-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Avg/Campaign</p>
                <p className="text-lg font-bold text-gray-900">
                  {totalCampaigns > 0 ? Math.round(totalApplications / totalCampaigns) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {totalCampaigns === 0 ? (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
            <Target className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Ready to launch your first campaign? 🎯
            </h3>
            <p className="text-gray-600 mb-6">
              Connect with influencers and grow your brand reach through targeted campaigns.
            </p>
            <Link
              href="/brand/campaigns/create"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Your First Campaign</span>
            </Link>
          </div>
        ) : (
          <div>
            {/* Draft Campaigns */}
            {draftCampaigns > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  Draft Campaigns ({draftCampaigns})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns
                    .filter((c: any) => c.status === 'draft')
                    .map((campaign: any) => (
                      <CampaignCardClient key={campaign.id} campaign={campaign} />
                    ))}
                </div>
              </div>
            )}

            {/* Active Campaigns */}
            {activeCampaigns > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  Active Campaigns ({activeCampaigns})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns
                    .filter((c: any) => c.status === 'active')
                    .map((campaign: any) => (
                      <CampaignCardClient key={campaign.id} campaign={campaign} />
                    ))}
                </div>
              </div>
            )}

            {/* Other Campaigns */}
            {campaigns.filter((c: any) => !['draft', 'active'].includes(c.status)).length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Other Campaigns
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {campaigns
                    .filter((c: any) => !['draft', 'active'].includes(c.status))
                    .map((campaign: any) => (
                      <CampaignCardClient key={campaign.id} campaign={campaign} />
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips for Success */}
        {totalCampaigns > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Campaign Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Write clear, detailed campaign descriptions to attract quality applications</li>
              <li>• Set realistic budgets based on influencer tier and deliverables</li>
              <li>• Review applications promptly to secure top influencers</li>
              <li>• Monitor campaign performance and engage with selected creators</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}