import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TrendingUp, Eye, Heart, MessageSquare, Share2, DollarSign, Target, Award } from 'lucide-react'

export default async function InfluencerAnalyticsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get all submissions with metrics for the influencer
  const { data: submissions } = await supabase
    .from('submissions')
    .select(`
      *,
      campaigns(title, brand_profiles(company_name))
    `)
    .eq('influencer_id', user.id)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Get earnings data
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, status, created_at')
    .eq('user_id', user.id)
    .eq('type', 'earning')

  // Calculate aggregate metrics
  const totalReach = submissions?.reduce((sum, sub) => sum + (sub.metrics?.views || 0), 0) || 0
  const totalLikes = submissions?.reduce((sum, sub) => sum + (sub.metrics?.likes || 0), 0) || 0
  const totalComments = submissions?.reduce((sum, sub) => sum + (sub.metrics?.comments || 0), 0) || 0
  const totalShares = submissions?.reduce((sum, sub) => sum + (sub.metrics?.shares || 0), 0) || 0
  
  const totalEarnings = transactions?.reduce((sum, t) => {
    if (t.status === 'completed') return sum + t.amount
    return sum
  }, 0) || 0
  
  const pendingEarnings = transactions?.reduce((sum, t) => {
    if (t.status === 'pending') return sum + t.amount
    return sum
  }, 0) || 0

  // Calculate average engagement rate
  const { data: profile } = await supabase
    .from('influencer_profiles')
    .select('follower_count')
    .eq('user_id', user.id)
    .single()

  const avgEngagementRate = profile?.follower_count && submissions?.length
    ? ((totalLikes + totalComments + totalShares) / (profile.follower_count * submissions.length)) * 100
    : 0

  // Get top performing content
  const topContent = submissions
    ?.sort((a, b) => {
      const aEngagement = (a.metrics?.likes || 0) + (a.metrics?.comments || 0) + (a.metrics?.shares || 0)
      const bEngagement = (b.metrics?.likes || 0) + (b.metrics?.comments || 0) + (b.metrics?.shares || 0)
      return bEngagement - aEngagement
    })
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Performance Analytics</h1>
            <p className="text-gray-600">Track your content performance and earnings</p>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalReach.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Reach</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-pink-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{totalLikes.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Likes</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${totalEarnings.toLocaleString()}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Earnings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{avgEngagementRate.toFixed(2)}%</h3>
          <p className="text-sm text-gray-600 mt-1">Avg Engagement</p>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Overview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Earnings Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Completed Payments</p>
                <p className="text-xs text-gray-500">Successfully received</p>
              </div>
              <p className="text-lg font-bold text-green-600">${totalEarnings.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Pending Payments</p>
                <p className="text-xs text-gray-500">Awaiting processing</p>
              </div>
              <p className="text-lg font-bold text-yellow-600">${pendingEarnings.toLocaleString()}</p>
            </div>
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Total Submissions</p>
                <p className="text-xs text-gray-500">Approved content</p>
              </div>
              <p className="text-lg font-bold text-blue-600">{submissions?.length || 0}</p>
            </div>
          </div>
        </div>

        {/* Top Performing Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h2>
          <div className="space-y-3">
            {topContent && topContent.length > 0 ? (
              topContent.map((submission, index) => {
                const engagement = (submission.metrics?.likes || 0) + 
                                 (submission.metrics?.comments || 0) + 
                                 (submission.metrics?.shares || 0)
                return (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-bold">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                          {submission.campaigns?.title || 'Campaign'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {engagement.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">engagements</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No submissions yet</p>
                <p className="text-xs mt-1">Complete campaigns to see your performance</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalComments.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Comments</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Share2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalShares.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Shares</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalLikes.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Likes</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalReach.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Views</p>
          </div>
        </div>
      </div>
    </div>
  )
}