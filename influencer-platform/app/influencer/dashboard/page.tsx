import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Trophy, 
  DollarSign, 
  Calendar, 
  TrendingUp,
  User,
  MessageSquare,
  Star,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Settings
} from 'lucide-react'

export default async function InfluencerDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is an influencer
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'influencer') {
    redirect('/auth/login')
  }

  // Get influencer profile
  const { data: profile } = await supabase
    .from('influencer_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Get dashboard statistics
  const [
    { data: activeCampaigns },
    { data: totalEarnings }
  ] = await Promise.all([
    supabase
      .from('campaign_applications')
      .select('campaign_id, campaigns(title, budget_amount)')
      .eq('influencer_id', user.id)
      .eq('status', 'approved'),
    
    supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', user.id)
      .eq('type', 'earning')
      .eq('status', 'completed')
  ])

  const stats = {
    activeCampaigns: activeCampaigns?.length || 0,
    pendingSubmissions: 0,
    completedSubmissions: 0,
    totalEarnings: totalEarnings?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    reputationScore: profile?.reputation_score || 0
  }

  // Get recent campaigns with application status
  const { data: recentCampaigns } = await supabase
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
      brand_profiles(company_name),
      campaign_applications!left(id, status, influencer_id)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {userData.full_name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Here's what's happening with your campaigns and earnings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedSubmissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Star className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reputation</p>
                <p className="text-2xl font-bold text-gray-900">{stats.reputationScore}/100</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Available Campaigns */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Latest Campaigns</h2>
              <p className="text-sm text-gray-600">New opportunities for you</p>
            </div>
            <div className="p-6">
              {recentCampaigns && recentCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => {
                    const userApplication = campaign.campaign_applications?.find(
                      app => app.influencer_id === user.id
                    )
                    const hasApplied = !!userApplication
                    const applicationStatus = userApplication?.status

                    return (
                      <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-600">
                              1K/${campaign.cpm_rate || 0}
                            </span>
                            <p className="text-xs text-gray-500">
                              Max: {((campaign.max_views || 0) / 1000).toFixed(0)}K views
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {campaign.description && campaign.description.length > 100
                            ? `${campaign.description.substring(0, 100)}...`
                            : campaign.description
                          }
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>By {campaign.brand_profiles?.company_name || 'Brand'}</span>
                            <span>•</span>
                            <span>Ends {new Date(campaign.end_date).toLocaleDateString()}</span>
                          </div>
                          {hasApplied ? (
                            <div className="flex items-center space-x-2">
                              {applicationStatus === 'pending' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Applied
                                </span>
                              )}
                              {applicationStatus === 'approved' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approved
                                </span>
                              )}
                              {applicationStatus === 'rejected' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Rejected
                                </span>
                              )}
                            </div>
                          ) : (
                            <a 
                              href={`/influencer/campaigns/${campaign.id}`}
                              className="inline-block bg-primary-600 text-white px-4 py-2 rounded-md text-sm hover:bg-primary-700 transition-colors"
                            >
                              Apply Now
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No new campaigns available</p>
                  <p className="text-sm text-gray-400">Check back later for new opportunities</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Profile Summary */}
          <div className="space-y-6">
            {/* Profile Completion */}
            {profile && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h3>
                <div className="space-y-3">
                  {/* Calculate completion percentage */}
                  {(() => {
                    const fields = [
                      profile.bio,
                      profile.username,
                      profile.instagram_handle,
                      profile.tiktok_handle,
                      profile.follower_count,
                      profile.categories?.length
                    ]
                    const completed = fields.filter(Boolean).length
                    const percentage = Math.round((completed / fields.length) * 100)
                    
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completion</span>
                          <span className="font-medium">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        {percentage < 100 && (
                          <p className="text-sm text-gray-500">
                            Complete your profile to get more campaign opportunities
                          </p>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/influencer/campaigns"
                  className="block w-full bg-primary-600 text-white text-center py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Browse Campaigns
                </a>
                <a
                  href="/influencer/applications"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  My Applications
                </a>
                <a
                  href="/influencer/earnings"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Earnings
                </a>
                <a
                  href="/influencer/analytics"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Analytics
                </a>
                <a
                  href="/influencer/profile"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Profile
                </a>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
              <p className="text-sm text-gray-600">
                {stats.reputationScore < 50
                  ? "Complete campaigns on time and follow brand guidelines to improve your reputation score!"
                  : stats.reputationScore < 80
                  ? "You're doing great! Keep up the quality work to reach elite status."
                  : "Excellent work! Your high reputation score attracts premium campaigns."
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}