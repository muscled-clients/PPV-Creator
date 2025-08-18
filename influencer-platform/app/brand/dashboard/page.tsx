import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  TrendingUp,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Target,
  CreditCard,
  Building2,
  Settings
} from 'lucide-react'

type Submission = {
  id: string
  status: string
  post_url?: string | null
  created_at: string
  campaign_id: string
  influencer_id: string
  campaigns?: {
    id: string
    title: string
  } | null
  user_profiles?: {
    id: string
    full_name: string
    email: string
  } | null
}

type Campaign = {
  id: string
  title: string
  description?: string | null
  budget_amount: number
  cpm_rate?: number | null
  max_views?: number | null
  total_budget_calculated?: number | null
  start_date: string
  end_date: string
  status: string
  campaign_applications?: Array<{ id: string }>
}

type Transaction = {
  amount: number
}

type Application = {
  id: string
  campaign_id: string
}

export default async function BrandDashboard() {
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

  // Get brand profile
  const { data: profile } = await supabase
    .from('brand_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get dashboard statistics
  const [
    activeCampaignsResult,
    totalCampaignsResult,
    pendingApplicationsResult,
    totalSpentResult,
    recentSubmissionsResult
  ] = await Promise.all([
    supabase
      .from('campaigns')
      .select('id')
      .eq('brand_id', user.id)
      .eq('status', 'active'),
    
    supabase
      .from('campaigns')
      .select('id')
      .eq('brand_id', user.id),
    
    supabase
      .from('campaign_applications')
      .select('id, campaign_id')
      .eq('status', 'pending')
      .in('campaign_id', (await supabase
        .from('campaigns')
        .select('id')
        .eq('brand_id', user.id)).data?.map(c => c.id) || []),
    
    supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('status', 'completed'),
    
    Promise.resolve({ data: [], error: null })
  ])

  const activeCampaigns = activeCampaignsResult.data
  const totalCampaigns = totalCampaignsResult.data
  const pendingApplications = pendingApplicationsResult.data
  const totalSpent = totalSpentResult.data as Transaction[] | null
  const recentSubmissions = recentSubmissionsResult.data as Submission[] | null

  const stats = {
    activeCampaigns: activeCampaigns?.length || 0,
    totalCampaigns: totalCampaigns?.length || 0,
    pendingApplications: pendingApplications?.length || 0,
    totalSpent: totalSpent?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  }

  // Get recent campaigns
  const { data: recentCampaigns }: { data: Campaign[] | null } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      description,
      budget_amount,
      cpm_rate,
      max_views,
      total_budget_calculated,
      start_date,
      end_date,
      status,
      campaign_applications(id)
    `)
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Brand Dashboard 🚀
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your campaigns and connect with influencers
            </p>
          </div>
          <Link
            href="/brand/campaigns/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Users className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Campaigns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Your Campaigns</h2>
              <p className="text-sm text-gray-600">Recent campaign activity</p>
            </div>
            <div className="p-6">
              {recentCampaigns && recentCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {campaign.description && campaign.description.length > 80
                              ? `${campaign.description.substring(0, 80)}...`
                              : campaign.description
                            }
                          </p>
                        </div>
                        <div className="ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="font-medium text-green-600">
                            1K/${campaign.cpm_rate || 0} • Max {((campaign.max_views || 0) / 1000).toFixed(0)}K views
                          </span>
                          <span>•</span>
                          <span>{campaign.campaign_applications?.length || 0} applications</span>
                          <span>•</span>
                          <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            href={`/brand/campaigns/${campaign.id}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No campaigns yet</p>
                  <p className="text-sm text-gray-400 mb-4">Create your first campaign to get started</p>
                  <Link
                    href="/brand/campaigns/create"
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Submissions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
              {recentSubmissions && recentSubmissions.length > 0 ? (
                <div className="space-y-3">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`p-1 rounded-full ${
                        submission.status === 'approved' 
                          ? 'bg-green-100'
                          : submission.status === 'pending_review' || submission.status === 'pending'
                          ? 'bg-yellow-100'
                          : 'bg-red-100'
                      }`}>
                        {submission.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {submission.user_profiles?.full_name || 'Influencer'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {submission.campaigns?.title || 'Campaign'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No submissions yet</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/brand/campaigns"
                  className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  My Campaigns
                </Link>
                <Link
                  href="/brand/applications"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Applications
                </Link>
                <Link
                  href="/brand/analytics"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Analytics
                </Link>
                <Link
                  href="/brand/payments"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Payments
                </Link>
                <Link
                  href="/brand/profile"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Company Profile
                </Link>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 Insights</h3>
              <p className="text-sm text-gray-600">
                {stats.activeCampaigns === 0
                  ? "Start by creating your first campaign to connect with influencers!"
                  : stats.pendingApplications > 0
                  ? `You have ${stats.pendingApplications} application${stats.pendingApplications > 1 ? 's' : ''} waiting for review.`
                  : "Great job managing your campaigns! Check analytics for performance insights."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}