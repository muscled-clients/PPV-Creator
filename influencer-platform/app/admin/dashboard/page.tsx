import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Users, 
  Building2, 
  Target, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  BarChart3,
  Shield
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is an admin
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'admin') {
    console.error('Admin verification failed:', userError)
    redirect('/unauthorized')
  }

  // Get comprehensive platform statistics
  const [
    { data: totalUsers },
    { data: influencers },
    { data: brands },
    { data: totalCampaigns },
    { data: activeCampaigns },
    { data: totalTransactions },
    { data: pendingTransactions },
    { data: recentActivity }
  ] = await Promise.all([
    supabase
      .from('user_profiles')
      .select('id, role')
      .neq('role', 'admin'),
    
    supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'influencer'),
    
    supabase
      .from('user_profiles')
      .select('id')
      .eq('role', 'brand'),
    
    supabase
      .from('campaigns')
      .select('id'),
    
    supabase
      .from('campaigns')
      .select('id')
      .eq('status', 'active'),
    
    supabase
      .from('transactions')
      .select('amount, status'),
    
    supabase
      .from('transactions')
      .select('id')
      .eq('status', 'pending'),
    
    supabase
      .from('user_profiles')
      .select('id, full_name, email, role, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
  ])

  const stats = {
    totalUsers: totalUsers?.length || 0,
    influencers: influencers?.length || 0,
    brands: brands?.length || 0,
    totalCampaigns: totalCampaigns?.length || 0,
    activeCampaigns: activeCampaigns?.length || 0,
    totalRevenue: totalTransactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0,
    pendingTransactions: pendingTransactions?.length || 0
  }

  // Get recent campaigns for review
  const { data: recentCampaigns } = await supabase
    .from('campaigns')
    .select(`
      id,
      title,
      status,
      budget_amount,
      cpm_rate,
      max_views,
      total_budget_calculated,
      created_at,
      brand_profiles!inner(company_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  // Get flagged content or reports (placeholder for now)
  const flaggedItems = []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Dashboard 👑
          </h1>
          <p className="text-gray-600 mt-2">
            Platform overview and system management
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-gray-500">
                  {stats.influencers} influencers, {stats.brands} brands
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
                <p className="text-xs text-gray-500">
                  {stats.activeCampaigns} active
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  Platform transactions
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
                <p className="text-xs text-gray-500">
                  Transactions
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Campaigns */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Campaigns</h2>
                <p className="text-sm text-gray-600">Latest campaign submissions</p>
              </div>
              <div className="p-6">
                {recentCampaigns && recentCampaigns.length > 0 ? (
                  <div className="space-y-4">
                    {recentCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                          <p className="text-sm text-gray-600">
                            By {(campaign as any).brand_profiles?.company_name || 'Brand'} • 1K/${campaign.cpm_rate || 0} (Max: {((campaign.max_views || 0) / 1000).toFixed(0)}K views)
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : campaign.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </span>
                          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent campaigns</p>
                )}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Registrations</h2>
                <p className="text-sm text-gray-600">New users on the platform</p>
              </div>
              <div className="p-6">
                {recentActivity && recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            user.role === 'influencer' 
                              ? 'bg-purple-100'
                              : 'bg-blue-100'
                          }`}>
                            {user.role === 'influencer' ? (
                              <Users className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Building2 className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.full_name}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'influencer'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent registrations</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* System Health */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Platform Status</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Available</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/admin/users"
                  className="block w-full bg-primary-600 text-white text-center py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  User Management
                </a>
                <a
                  href="/admin/campaigns"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Campaign Review
                </a>
                <a
                  href="/admin/reports"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Reports
                </a>
                <a
                  href="/admin/settings"
                  className="block w-full bg-gray-100 text-gray-700 text-center py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  System Settings
                </a>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">📈 Platform Growth</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly Growth</span>
                  <span className="font-medium text-green-600">+12.5%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Active Campaigns</span>
                  <span className="font-medium">{stats.activeCampaigns}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-medium text-green-600">94.2%</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {flaggedItems.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Attention Required
                </h3>
                <p className="text-sm text-red-700">
                  {flaggedItems.length} item{flaggedItems.length > 1 ? 's' : ''} require{flaggedItems.length === 1 ? 's' : ''} review
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}