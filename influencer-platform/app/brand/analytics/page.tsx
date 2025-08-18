import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  Calendar,
  Target,
  Activity,
  Download,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { ExportButton } from '@/components/analytics/export-button'

export default async function BrandAnalyticsPage() {
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

  // Get all campaign data with related information
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })

  const { data: applications } = await supabase
    .from('campaign_applications')
    .select(`
      *,
      campaigns!inner(brand_id, title, category),
      user_profiles:influencer_id(full_name, username)
    `)
    .eq('campaigns.brand_id', user.id)


  // Calculate real metrics
  const totalCampaigns = campaigns?.length || 0
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0
  const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0
  const draftCampaigns = campaigns?.filter(c => c.status === 'draft').length || 0
  const totalBudget = campaigns?.reduce((sum, c) => sum + (c.budget_amount || 0), 0) || 0
  const totalApplications = applications?.length || 0
  const approvedApplications = applications?.filter(a => a.status === 'approved').length || 0
  const pendingApplications = applications?.filter(a => a.status === 'pending').length || 0
  const conversionRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : '0'
  const totalSubmissions = 0
  const approvedSubmissions = 0

  // Calculate monthly data from real campaigns
  const monthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentYear = new Date().getFullYear()
    const data = []

    for (let i = 0; i < 6; i++) {
      const monthIndex = new Date().getMonth() - (5 - i)
      const adjustedMonth = monthIndex < 0 ? monthIndex + 12 : monthIndex
      const year = monthIndex < 0 ? currentYear - 1 : currentYear

      const monthCampaigns = campaigns?.filter(c => {
        const date = new Date(c.created_at)
        return date.getMonth() === adjustedMonth && date.getFullYear() === year
      }) || []

      const monthApplications = applications?.filter(a => {
        const date = new Date(a.created_at)
        return date.getMonth() === adjustedMonth && date.getFullYear() === year
      }) || []

      const monthSubmissions = []

      data.push({
        month: months[adjustedMonth],
        campaigns: monthCampaigns.length,
        applications: monthApplications.length,
        submissions: monthSubmissions.length
      })
    }

    return data
  }

  // Calculate category performance from real data
  const categoryPerformance = () => {
    const categories = new Map()

    campaigns?.forEach(campaign => {
      const category = campaign.category || 'Uncategorized'
      if (!categories.has(category)) {
        categories.set(category, {
          category,
          campaigns: 0,
          applications: 0,
          budget: 0,
          submissions: 0
        })
      }

      const cat = categories.get(category)
      cat.campaigns++
      cat.budget += campaign.budget_amount || 0
      cat.applications += applications?.filter(a => a.campaign_id === campaign.id).length || 0
      cat.submissions += 0
    })

    return Array.from(categories.values()).slice(0, 5)
  }

  const realMonthlyData = monthlyData()
  const realCategoryPerformance = categoryPerformance()

  // Calculate growth percentages (comparing to previous period)
  const calculateGrowth = () => {
    const now = new Date()
    const thisMonth = now.getMonth()
    const lastMonth = thisMonth - 1 < 0 ? 11 : thisMonth - 1
    
    const thisMonthCampaigns = campaigns?.filter(c => {
      const date = new Date(c.created_at)
      return date.getMonth() === thisMonth
    }).length || 0

    const lastMonthCampaigns = campaigns?.filter(c => {
      const date = new Date(c.created_at)
      return date.getMonth() === lastMonth
    }).length || 0

    const growth = lastMonthCampaigns > 0 
      ? ((thisMonthCampaigns - lastMonthCampaigns) / lastMonthCampaigns * 100).toFixed(0)
      : '0'

    return {
      campaigns: parseInt(growth),
      applications: 0, // Could calculate similarly for applications
      budget: 0, // Could calculate similarly for budget
      submissions: 0 // Could calculate similarly for submissions
    }
  }

  const growth = calculateGrowth()

  // Prepare export data
  const exportData = {
    campaigns: campaigns || [],
    applications: applications || [],
    submissions: submissions || [],
    metrics: {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalBudget,
      totalApplications,
      approvedApplications,
      conversionRate: parseFloat(conversionRate),
      totalSubmissions,
      approvedSubmissions
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Track your campaign performance and insights
              </p>
            </div>
            <ExportButton data={exportData} userName={userData.full_name} />
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              {growth.campaigns !== 0 && (
                <span className={`text-sm font-medium flex items-center ${growth.campaigns > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {growth.campaigns > 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                  {Math.abs(growth.campaigns)}%
                </span>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalCampaigns}</h3>
            <p className="text-sm text-gray-600">Total Campaigns</p>
            <div className="mt-2 text-xs text-gray-500">
              {activeCampaigns} active • {completedCampaigns} completed • {draftCampaigns} draft
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Total Investment</p>
            <div className="mt-2 text-xs text-gray-500">
              Avg: ${totalCampaigns > 0 ? Math.round(totalBudget / totalCampaigns).toLocaleString() : 0} per campaign
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalApplications}</h3>
            <p className="text-sm text-gray-600">Total Applications</p>
            <div className="mt-2 text-xs text-gray-500">
              {approvedApplications} approved • {pendingApplications} pending
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Activity className="w-6 h-6 text-pink-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalSubmissions}</h3>
            <p className="text-sm text-gray-600">Content Created</p>
            <div className="mt-2 text-xs text-gray-500">
              {approvedSubmissions} approved • {conversionRate}% approval rate
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campaign Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Monthly Trends (Last 6 Months)</h2>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {realMonthlyData.map((month, index) => {
                const maxValue = Math.max(...realMonthlyData.map(m => m.applications), 1)
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 w-12">{month.month}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-gray-500">Campaigns: {month.campaigns}</span>
                        <span className="text-gray-500">Applications: {month.applications}</span>
                        <span className="text-gray-500">Submissions: {month.submissions}</span>
                      </div>
                    </div>
                    <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${maxValue > 0 ? (month.applications / maxValue) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              {realMonthlyData.every(m => m.campaigns === 0) && (
                <p className="text-center text-gray-500 py-4">No data available yet</p>
              )}
            </div>
          </div>

          {/* Category Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {realCategoryPerformance.length > 0 ? (
                realCategoryPerformance.map((cat) => (
                  <div key={cat.category} className="border-b border-gray-100 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">{cat.category}</span>
                      <span className="text-sm text-gray-600">{cat.campaigns} campaigns</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-gray-600">
                        Budget: <span className="font-medium text-gray-900">${cat.budget.toLocaleString()}</span>
                      </div>
                      <div className="text-gray-600">
                        Applications: <span className="font-medium text-gray-900">{cat.applications}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No category data available yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Campaign Activity</h2>
          <div className="space-y-4">
            {campaigns && campaigns.length > 0 ? (
              campaigns.slice(0, 5).map((campaign) => {
                const campaignApplications = applications?.filter(a => a.campaign_id === campaign.id).length || 0
                const campaignSubmissions = 0
                
                return (
                  <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        campaign.status === 'active' ? 'bg-green-500' :
                        campaign.status === 'completed' ? 'bg-blue-500' :
                        campaign.status === 'draft' ? 'bg-yellow-500' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                        <p className="text-sm text-gray-600">
                          Created {new Date(campaign.created_at).toLocaleDateString()} • 
                          {campaignApplications} applications • 
                          {campaignSubmissions} submissions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">${campaign.budget_amount?.toLocaleString()}</p>
                      <p className="text-sm text-gray-600 capitalize">{campaign.status}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No campaigns yet</p>
                <Link 
                  href="/brand/campaigns/create"
                  className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Create your first campaign →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}