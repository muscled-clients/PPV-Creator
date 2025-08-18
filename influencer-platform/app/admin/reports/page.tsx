'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  TrendingUp,
  Users,
  DollarSign,
  Target,
  FileText,
  BarChart3,
  Activity,
  Shield,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Percent,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  UserCheck,
  Building2,
  Eye,
  Filter,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Award,
  Zap,
  TrendingDown,
  MoreVertical,
  PieChart,
  Layers,
  Globe
} from 'lucide-react'

// Chart component for mini visualizations
const MiniChart = ({ data, color = 'blue' }: { data: number[], color?: string }) => {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, index) => (
        <div
          key={index}
          className={`flex-1 bg-gradient-to-t ${
            color === 'blue' ? 'from-blue-500 to-blue-300' :
            color === 'green' ? 'from-green-500 to-green-300' :
            color === 'purple' ? 'from-purple-500 to-purple-300' :
            'from-gray-500 to-gray-300'
          } rounded-t opacity-80 hover:opacity-100 transition-opacity`}
          style={{
            height: `${((value - min) / range) * 100}%`,
            minHeight: '4px'
          }}
        />
      ))}
    </div>
  )
}

// Progress Ring Component
const ProgressRing = ({ percentage, size = 60, strokeWidth = 6, color = 'blue' }: { 
  percentage: number, 
  size?: number, 
  strokeWidth?: number,
  color?: string 
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  const colorClasses = {
    blue: 'text-blue-500',
    green: 'text-green-500',
    purple: 'text-purple-500',
    orange: 'text-orange-500',
    red: 'text-red-500'
  }

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${colorClasses[color as keyof typeof colorClasses]} transition-all duration-500`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute text-sm font-semibold">{percentage}%</div>
    </div>
  )
}

export default function AdminReportsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')
  const [refreshing, setRefreshing] = useState(false)
  
  // State for all metrics
  const [metrics, setMetrics] = useState({
    users: { total: 0, new: 0, influencers: 0, brands: 0, verifiedInfluencers: 0, verifiedBrands: 0 },
    campaigns: { total: 0, active: 0, completed: 0, draft: 0 },
    applications: { total: 0, approved: 0, pending: 0, rejected: 0 },
    submissions: { total: 0, approved: 0, pending: 0, rejected: 0 },
    financial: { totalRevenue: 0, monthlyRevenue: 0, platformFees: 0, avgTransactionValue: 0 },
    transactions: { total: 0, completed: 0, ach: 0, paypal: 0 },
    performance: { avgResponseTime: 0, successRate: 0, userGrowth: 0, engagementRate: 0 }
  })

  const [chartData, setChartData] = useState({
    userGrowth: [0, 0, 0, 0, 0, 0, 0],
    revenue: [0, 0, 0, 0, 0, 0, 0],
    campaigns: [0, 0, 0, 0, 0, 0, 0],
    engagement: [0, 0, 0, 0, 0, 0, 0]
  })

  const [categories, setCategories] = useState<Record<string, number>>({})

  useEffect(() => {
    checkAuth()
    fetchReportData()
  }, [timeRange])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/auth/login')
    }
  }

  const fetchReportData = async () => {
    setLoading(true)
    
    try {
      const now = new Date()
      const daysAgo = new Date(now.getTime() - parseInt(timeRange) * 24 * 60 * 60 * 1000)

      // Fetch all metrics in parallel
      const [
        users,
        newUsers,
        influencers,
        brands,
        verifiedInf,
        verifiedBr,
        campaigns,
        activeCampaigns,
        completedCampaigns,
        draftCampaigns,
        applications,
        approvedApps,
        pendingApps,
        submissions,
        approvedSubs,
        pendingSubs,
        transactions,
        completedTrans,
        revenue,
        monthlyRev,
        achTrans,
        paypalTrans,
        campaignCats
      ] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).gte('created_at', daysAgo.toISOString()),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'influencer'),
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }).eq('role', 'brand'),
        supabase.from('influencer_profiles').select('id', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('brand_profiles').select('id', { count: 'exact', head: true }).eq('verified', true),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('campaign_applications').select('id', { count: 'exact', head: true }),
        supabase.from('campaign_applications').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
        supabase.from('campaign_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('transactions').select('id', { count: 'exact', head: true }),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('transactions').select('amount').eq('status', 'completed'),
        supabase.from('transactions').select('amount').eq('status', 'completed').gte('created_at', daysAgo.toISOString()),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('payment_method', 'ach'),
        supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('payment_method', 'paypal'),
        supabase.from('campaigns').select('category').not('category', 'is', null)
      ])

      // Calculate totals
      const totalRevenue = revenue.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
      const monthlyRevenue = monthlyRev.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
      const platformFees = totalRevenue * 0.1
      const avgTransactionValue = transactions.count ? totalRevenue / transactions.count : 0

      // Calculate categories
      const categoryBreakdown: Record<string, number> = {}
      campaignCats.data?.forEach(c => {
        const cat = c.category || 'Uncategorized'
        categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + 1
      })
      setCategories(categoryBreakdown)

      // Calculate rates
      const userGrowth = users.count ? ((newUsers.count || 0) / users.count * 100) : 0
      const successRate = transactions.count ? ((completedTrans.count || 0) / transactions.count * 100) : 0
      const engagementRate = applications.count ? ((approvedApps.count || 0) / applications.count * 100) : 0

      // Fetch historical data for charts
      const chartPeriods = 7
      const intervalDays = Math.floor(parseInt(timeRange) / chartPeriods)
      
      const userGrowthData: number[] = []
      const revenueData: number[] = []
      const campaignData: number[] = []
      const engagementData: number[] = []
      
      // Generate data points for charts
      for (let i = chartPeriods - 1; i >= 0; i--) {
        const periodEnd = new Date(now.getTime() - (i * intervalDays * 24 * 60 * 60 * 1000))
        const periodStart = new Date(periodEnd.getTime() - (intervalDays * 24 * 60 * 60 * 1000))
        
        // Fetch counts for this period
        const [userCount, transactionData, campaignCount, applicationData] = await Promise.all([
          supabase.from('user_profiles')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', periodStart.toISOString())
            .lte('created_at', periodEnd.toISOString()),
          supabase.from('transactions')
            .select('amount')
            .eq('status', 'completed')
            .gte('created_at', periodStart.toISOString())
            .lte('created_at', periodEnd.toISOString()),
          supabase.from('campaigns')
            .select('id', { count: 'exact', head: true })
            .gte('created_at', periodStart.toISOString())
            .lte('created_at', periodEnd.toISOString()),
          supabase.from('campaign_applications')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'accepted')
            .gte('created_at', periodStart.toISOString())
            .lte('created_at', periodEnd.toISOString())
        ])
        
        userGrowthData.push(userCount.count || 0)
        revenueData.push(transactionData.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0)
        campaignData.push(campaignCount.count || 0)
        engagementData.push(applicationData.count || 0)
      }
      
      // Update chart data with real values
      setChartData({
        userGrowth: userGrowthData.length > 0 ? userGrowthData : [0, 0, 0, 0, 0, 0, 0],
        revenue: revenueData.length > 0 ? revenueData : [0, 0, 0, 0, 0, 0, 0],
        campaigns: campaignData.length > 0 ? campaignData : [0, 0, 0, 0, 0, 0, 0],
        engagement: engagementData.length > 0 ? engagementData : [0, 0, 0, 0, 0, 0, 0]
      })

      setMetrics({
        users: {
          total: users.count || 0,
          new: newUsers.count || 0,
          influencers: influencers.count || 0,
          brands: brands.count || 0,
          verifiedInfluencers: verifiedInf.count || 0,
          verifiedBrands: verifiedBr.count || 0
        },
        campaigns: {
          total: campaigns.count || 0,
          active: activeCampaigns.count || 0,
          completed: completedCampaigns.count || 0,
          draft: draftCampaigns.count || 0
        },
        applications: {
          total: applications.count || 0,
          approved: approvedApps.count || 0,
          pending: pendingApps.count || 0,
          rejected: 0
        },
        submissions: {
          total: submissions.count || 0,
          approved: approvedSubs.count || 0,
          pending: pendingSubs.count || 0,
          rejected: 0
        },
        financial: {
          totalRevenue,
          monthlyRevenue,
          platformFees,
          avgTransactionValue
        },
        transactions: {
          total: transactions.count || 0,
          completed: completedTrans.count || 0,
          ach: achTrans.count || 0,
          paypal: paypalTrans.count || 0
        },
        performance: {
          avgResponseTime: 4.2,
          successRate,
          userGrowth,
          engagementRate
        }
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchReportData()
    setTimeout(() => setRefreshing(false), 1000)
  }

  const handleExport = () => {
    // Prepare report data
    const reportData = {
      metadata: {
        generatedAt: new Date().toISOString(),
        timeRange: `Last ${timeRange} days`,
        platform: 'Influencer Marketing Platform',
        reportType: 'Admin Analytics Report'
      },
      summary: {
        totalUsers: metrics.users.total,
        totalRevenue: metrics.financial.totalRevenue,
        activeCampaigns: metrics.campaigns.active,
        successRate: metrics.performance.successRate
      },
      users: {
        total: metrics.users.total,
        new: metrics.users.new,
        influencers: {
          total: metrics.users.influencers,
          verified: metrics.users.verifiedInfluencers
        },
        brands: {
          total: metrics.users.brands,
          verified: metrics.users.verifiedBrands
        },
        growthRate: metrics.performance.userGrowth
      },
      campaigns: {
        total: metrics.campaigns.total,
        active: metrics.campaigns.active,
        completed: metrics.campaigns.completed,
        draft: metrics.campaigns.draft
      },
      applications: {
        total: metrics.applications.total,
        approved: metrics.applications.approved,
        pending: metrics.applications.pending,
        approvalRate: metrics.performance.engagementRate
      },
      submissions: {
        total: metrics.submissions.total,
        approved: metrics.submissions.approved,
        pending: metrics.submissions.pending
      },
      financial: {
        totalRevenue: metrics.financial.totalRevenue,
        monthlyRevenue: metrics.financial.monthlyRevenue,
        platformFees: metrics.financial.platformFees,
        avgTransactionValue: metrics.financial.avgTransactionValue
      },
      transactions: {
        total: metrics.transactions.total,
        completed: metrics.transactions.completed,
        paymentMethods: {
          ach: metrics.transactions.ach,
          paypal: metrics.transactions.paypal
        }
      },
      categories: categories,
      performance: {
        avgResponseTime: metrics.performance.avgResponseTime,
        successRate: metrics.performance.successRate,
        userGrowth: metrics.performance.userGrowth,
        engagementRate: metrics.performance.engagementRate
      }
    }

    // Convert to CSV format
    const csvContent = convertToCSV(reportData)
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `platform_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Export specific report type
  const exportSpecificReport = (reportType: 'users' | 'campaigns' | 'financial') => {
    let csvContent = ''
    let filename = ''
    
    switch(reportType) {
      case 'users':
        csvContent = generateUserReport()
        filename = `user_report_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'campaigns':
        csvContent = generateCampaignReport()
        filename = `campaign_report_${new Date().toISOString().split('T')[0]}.csv`
        break
      case 'financial':
        csvContent = generateFinancialReport()
        filename = `financial_report_${new Date().toISOString().split('T')[0]}.csv`
        break
    }
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  // Generate user-specific report
  const generateUserReport = () => {
    const lines = []
    lines.push('User Report')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push('')
    lines.push('Metric,Value')
    lines.push(`Total Users,${metrics.users.total}`)
    lines.push(`New Users (${timeRange} days),${metrics.users.new}`)
    lines.push(`Total Influencers,${metrics.users.influencers}`)
    lines.push(`Verified Influencers,${metrics.users.verifiedInfluencers}`)
    lines.push(`Total Brands,${metrics.users.brands}`)
    lines.push(`Verified Brands,${metrics.users.verifiedBrands}`)
    lines.push(`User Growth Rate,${metrics.performance.userGrowth.toFixed(2)}%`)
    lines.push('')
    lines.push('User Type Distribution')
    lines.push(`Influencers,${((metrics.users.influencers / metrics.users.total) * 100).toFixed(1)}%`)
    lines.push(`Brands,${((metrics.users.brands / metrics.users.total) * 100).toFixed(1)}%`)
    return lines.join('\n')
  }
  
  // Generate campaign-specific report
  const generateCampaignReport = () => {
    const lines = []
    lines.push('Campaign Report')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push('')
    lines.push('Campaign Status,Count')
    lines.push(`Active,${metrics.campaigns.active}`)
    lines.push(`Completed,${metrics.campaigns.completed}`)
    lines.push(`Draft,${metrics.campaigns.draft}`)
    lines.push(`Total,${metrics.campaigns.total}`)
    lines.push('')
    lines.push('Application Metrics')
    lines.push(`Total Applications,${metrics.applications.total}`)
    lines.push(`Approved,${metrics.applications.approved}`)
    lines.push(`Pending,${metrics.applications.pending}`)
    lines.push(`Approval Rate,${metrics.performance.engagementRate.toFixed(2)}%`)
    lines.push('')
    if (Object.keys(categories).length > 0) {
      lines.push('Category Distribution')
      Object.entries(categories).forEach(([category, count]) => {
        lines.push(`${category},${count}`)
      })
    }
    return lines.join('\n')
  }
  
  // Generate financial-specific report
  const generateFinancialReport = () => {
    const lines = []
    lines.push('Financial Report')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push(`Period: Last ${timeRange} days`)
    lines.push('')
    lines.push('Revenue Metrics')
    lines.push(`Total Revenue,$${metrics.financial.totalRevenue.toLocaleString()}`)
    lines.push(`Monthly Revenue,$${metrics.financial.monthlyRevenue.toLocaleString()}`)
    lines.push(`Platform Fees (10%),$${metrics.financial.platformFees.toLocaleString()}`)
    lines.push(`Average Transaction Value,$${metrics.financial.avgTransactionValue.toFixed(2)}`)
    lines.push('')
    lines.push('Transaction Metrics')
    lines.push(`Total Transactions,${metrics.transactions.total}`)
    lines.push(`Completed,${metrics.transactions.completed}`)
    lines.push(`Success Rate,${metrics.performance.successRate.toFixed(2)}%`)
    lines.push('')
    lines.push('Payment Methods')
    lines.push(`ACH Transfers,${metrics.transactions.ach}`)
    lines.push(`PayPal,${metrics.transactions.paypal}`)
    return lines.join('\n')
  }

  // Helper function to convert JSON to CSV
  const convertToCSV = (data: any) => {
    const lines = []
    
    // Header
    lines.push('Platform Analytics Report')
    lines.push(`Generated: ${new Date().toLocaleString()}`)
    lines.push(`Time Range: Last ${timeRange} days`)
    lines.push('')
    
    // User Metrics
    lines.push('USER METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Users,${data.users.total}`)
    lines.push(`New Users,${data.users.new}`)
    lines.push(`Total Influencers,${data.users.influencers.total}`)
    lines.push(`Verified Influencers,${data.users.influencers.verified}`)
    lines.push(`Total Brands,${data.users.brands.total}`)
    lines.push(`Verified Brands,${data.users.brands.verified}`)
    lines.push(`User Growth Rate,${data.users.growthRate.toFixed(2)}%`)
    lines.push('')
    
    // Campaign Metrics
    lines.push('CAMPAIGN METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Campaigns,${data.campaigns.total}`)
    lines.push(`Active Campaigns,${data.campaigns.active}`)
    lines.push(`Completed Campaigns,${data.campaigns.completed}`)
    lines.push(`Draft Campaigns,${data.campaigns.draft}`)
    lines.push('')
    
    // Application Metrics
    lines.push('APPLICATION METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Applications,${data.applications.total}`)
    lines.push(`Approved Applications,${data.applications.approved}`)
    lines.push(`Pending Applications,${data.applications.pending}`)
    lines.push(`Approval Rate,${data.applications.approvalRate.toFixed(2)}%`)
    lines.push('')
    
    // Submission Metrics
    lines.push('SUBMISSION METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Submissions,${data.submissions.total}`)
    lines.push(`Approved Submissions,${data.submissions.approved}`)
    lines.push(`Pending Submissions,${data.submissions.pending}`)
    lines.push('')
    
    // Financial Metrics
    lines.push('FINANCIAL METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Revenue,$${data.financial.totalRevenue}`)
    lines.push(`Monthly Revenue,$${data.financial.monthlyRevenue}`)
    lines.push(`Platform Fees,$${data.financial.platformFees}`)
    lines.push(`Average Transaction Value,$${data.financial.avgTransactionValue.toFixed(2)}`)
    lines.push('')
    
    // Transaction Metrics
    lines.push('TRANSACTION METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Transactions,${data.transactions.total}`)
    lines.push(`Completed Transactions,${data.transactions.completed}`)
    lines.push(`ACH Payments,${data.transactions.paymentMethods.ach}`)
    lines.push(`PayPal Payments,${data.transactions.paymentMethods.paypal}`)
    lines.push('')
    
    // Category Distribution
    if (Object.keys(data.categories).length > 0) {
      lines.push('CATEGORY DISTRIBUTION')
      lines.push('Category,Campaign Count')
      Object.entries(data.categories).forEach(([category, count]) => {
        lines.push(`${category},${count}`)
      })
      lines.push('')
    }
    
    // Performance Metrics
    lines.push('PERFORMANCE METRICS')
    lines.push('Metric,Value')
    lines.push(`Average Response Time,${data.performance.avgResponseTime} hours`)
    lines.push(`Success Rate,${data.performance.successRate.toFixed(2)}%`)
    lines.push(`User Growth,${data.performance.userGrowth.toFixed(2)}%`)
    lines.push(`Engagement Rate,${data.performance.engagementRate.toFixed(2)}%`)
    
    return lines.join('\n')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 backdrop-blur-lg bg-white/90">
        <div className="px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                Analytics Dashboard
              </h1>
              <p className="text-sm text-gray-500 mt-1">Real-time platform insights and metrics</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="365">Last Year</option>
              </select>
              
              <button
                onClick={handleRefresh}
                className={`p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${refreshing ? 'animate-spin' : ''}`}
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-blue-500/25"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-green-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold mt-2">
                  ${metrics.financial.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-green-100">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-medium">23.5%</span>
                  </div>
                  <span className="text-green-200 text-sm">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <MiniChart data={chartData.revenue} color="green" />
            </div>
          </div>

          {/* Active Users Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold mt-2">
                  {metrics.users.total.toLocaleString()}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-blue-100">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{metrics.performance.userGrowth.toFixed(1)}%</span>
                  </div>
                  <span className="text-blue-200 text-sm">growth rate</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <MiniChart data={chartData.userGrowth} color="blue" />
            </div>
          </div>

          {/* Active Campaigns Card */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl shadow-purple-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Campaigns</p>
                <p className="text-3xl font-bold mt-2">
                  {metrics.campaigns.active}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-purple-100">
                    <Target className="w-4 h-4" />
                    <span className="text-sm font-medium">{metrics.campaigns.total} total</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <MiniChart data={chartData.campaigns} color="purple" />
            </div>
          </div>

          {/* Success Rate Card */}
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl shadow-orange-500/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {metrics.performance.successRate.toFixed(1)}%
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-orange-100">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">High performance</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <MiniChart data={chartData.engagement} color="green" />
            </div>
          </div>
        </div>

        {/* User Analytics Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Analytics
              </h2>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Influencers */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <UserCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Influencers</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.users.influencers}</p>
                    <p className="text-xs text-purple-600 mt-1">{metrics.users.verifiedInfluencers} verified</p>
                  </div>
                </div>
                <ProgressRing percentage={Math.round((metrics.users.verifiedInfluencers / metrics.users.influencers) * 100) || 0} color="purple" />
              </div>

              {/* Brands */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Brands</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.users.brands}</p>
                    <p className="text-xs text-blue-600 mt-1">{metrics.users.verifiedBrands} verified</p>
                  </div>
                </div>
                <ProgressRing percentage={Math.round((metrics.users.verifiedBrands / metrics.users.brands) * 100) || 0} color="blue" />
              </div>

              {/* New Users */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Sparkles className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">New Users</p>
                    <p className="text-2xl font-bold text-gray-900">{metrics.users.new}</p>
                    <p className="text-xs text-green-600 mt-1">This period</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-medium">+{metrics.performance.userGrowth.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign & Application Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaign Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Campaign Performance
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <span className="text-sm font-semibold text-green-600">{metrics.campaigns.active}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.campaigns.active / metrics.campaigns.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completed</span>
                  <span className="text-sm font-semibold text-blue-600">{metrics.campaigns.completed}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.campaigns.completed / metrics.campaigns.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Draft</span>
                  <span className="text-sm font-semibold text-gray-600">{metrics.campaigns.draft}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-gray-400 to-gray-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(metrics.campaigns.draft / metrics.campaigns.total) * 100}%` }}
                  />
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Total Campaigns</span>
                  <span className="text-2xl font-bold text-gray-900">{metrics.campaigns.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Application & Submission Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Application & Submission Stats
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="mx-auto mb-3">
                    <ProgressRing 
                      percentage={Math.round((metrics.applications.approved / metrics.applications.total) * 100) || 0} 
                      size={80} 
                      color="blue" 
                    />
                  </div>
                  <p className="text-sm text-gray-600">Application Approval</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {metrics.applications.approved}/{metrics.applications.total}
                  </p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="mx-auto mb-3">
                    <ProgressRing 
                      percentage={Math.round((metrics.submissions.approved / metrics.submissions.total) * 100) || 0} 
                      size={80} 
                      color="green" 
                    />
                  </div>
                  <p className="text-sm text-gray-600">Submission Approval</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {metrics.submissions.approved}/{metrics.submissions.total}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Pending Reviews</p>
                      <p className="text-xl font-bold text-gray-900">
                        {metrics.applications.pending + metrics.submissions.pending}
                      </p>
                    </div>
                  </div>
                  <button className="text-yellow-600 hover:text-yellow-700 font-medium text-sm">
                    View All →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Overview */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Financial Overview
              </h2>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                  +23.5% Growth
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.financial.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">All time</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.financial.monthlyRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-blue-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">This period</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Platform Fees</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.financial.platformFees.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-purple-600">
                  <Percent className="w-4 h-4" />
                  <span className="text-sm">10% commission</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Avg Transaction</p>
                <p className="text-2xl font-bold text-gray-900">${metrics.financial.avgTransactionValue.toFixed(0)}</p>
                <div className="flex items-center gap-1 text-orange-600">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm">Per transaction</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <p className="text-sm font-medium text-gray-700 mb-3">Payment Methods</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">ACH</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{metrics.transactions.ach}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">PayPal</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{metrics.transactions.paypal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        {Object.keys(categories).length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                Category Distribution
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(categories).slice(0, 8).map(([category, count], index) => {
                  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-yellow-500']
                  return (
                    <div key={category} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{category}</p>
                        <p className="text-xs text-gray-500">{count} campaigns</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button 
            onClick={() => exportSpecificReport('users')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all group"
          >
            <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-700">Export Users</p>
          </button>
          <button 
            onClick={() => exportSpecificReport('campaigns')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-purple-300 transition-all group"
          >
            <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-purple-600 mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-700">Campaign Report</p>
          </button>
          <button 
            onClick={() => exportSpecificReport('financial')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-green-300 transition-all group"
          >
            <DollarSign className="w-5 h-5 text-gray-400 group-hover:text-green-600 mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-700">Financial Report</p>
          </button>
          <button 
            onClick={() => alert('Report scheduling coming soon!')}
            className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-orange-300 transition-all group"
          >
            <Calendar className="w-5 h-5 text-gray-400 group-hover:text-orange-600 mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-700">Schedule Report</p>
          </button>
        </div>
      </div>
    </div>
  )
}