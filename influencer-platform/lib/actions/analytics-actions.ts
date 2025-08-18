'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Analytics data interfaces
export interface CampaignAnalytics {
  campaignId: string
  title: string
  budget: number
  spent: number
  applications: number
  approved: number
  submissions: number
  approvedSubmissions: number
  totalReach: number
  totalEngagement: number
  startDate: string
  endDate: string
  status: string
}

export interface RevenueAnalytics {
  totalRevenue: number
  monthlyRevenue: Array<{ month: string; revenue: number; campaigns: number }>
  paymentMethodDistribution: Record<string, { count: number; amount: number }>
  platformFees: number
  processingFees: number
  netRevenue: number
}

export interface PerformanceMetrics {
  totalCampaigns: number
  activeCampaigns: number
  completedCampaigns: number
  averageEngagementRate: number
  averageROI: number
  topPerformingInfluencers: Array<{
    id: string
    name: string
    score: number
    submissions: number
    approvalRate: number
  }>
}

// Get campaign analytics for brands
export async function getCampaignAnalytics(filters?: {
  campaignId?: string
  startDate?: Date
  endDate?: Date
  status?: string
}) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user is a brand
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'brand') {
      return { success: false, error: 'Only brands can access campaign analytics' }
    }

    // Build query
    let query = supabase
      .from('campaigns')
      .select(`
        *,
        applications!inner(
          id,
          status,
          influencer_id,
          proposed_rate
        ),
        submissions!inner(
          id,
          status,
          metrics,
          created_at
        )
      `)
      .eq('brand_id', user.id)

    // Apply filters
    if (filters?.campaignId) {
      query = query.eq('id', filters.campaignId)
    }

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }

    const { data: campaigns, error } = await query

    if (error) {
      console.error('Campaign analytics error:', error)
      return { success: false, error: 'Failed to fetch campaign analytics' }
    }

    // Process analytics data
    const analytics: CampaignAnalytics[] = campaigns?.map(campaign => {
      const applications = campaign.applications || []
      const submissions = campaign.submissions || []
      
      const approvedApplications = applications.filter(app => app.status === 'approved')
      const approvedSubmissions = submissions.filter(sub => sub.status === 'approved')
      
      // Calculate total reach and engagement
      let totalReach = 0
      let totalEngagement = 0
      
      submissions.forEach(submission => {
        if (submission.metrics) {
          const metrics = submission.metrics as any
          totalEngagement += (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
          // Estimate reach based on engagement (simplified)
          totalReach += Math.floor(totalEngagement * 10)
        }
      })

      // Calculate spent amount (simplified as approved applications * proposed rate)
      const spent = approvedApplications.reduce((sum, app) => sum + (app.proposed_rate || 0), 0)

      return {
        campaignId: campaign.id,
        title: campaign.title,
        budget: campaign.budget_amount,
        spent,
        applications: applications.length,
        approved: approvedApplications.length,
        submissions: submissions.length,
        approvedSubmissions: approvedSubmissions.length,
        totalReach,
        totalEngagement,
        startDate: campaign.start_date,
        endDate: campaign.end_date,
        status: campaign.status
      }
    }) || []

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Get campaign analytics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get revenue analytics
export async function getRevenueAnalytics(period: 'month' | 'quarter' | 'year' = 'month') {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get all transactions for the user
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        payment_methods(type)
      `)
      .eq('user_id', user.id)
      .eq('type', 'payout')
      .order('created_at', { ascending: false })

    if (txError) {
      console.error('Revenue analytics error:', txError)
      return { success: false, error: 'Failed to fetch revenue data' }
    }

    // Calculate total revenue
    const totalRevenue = transactions?.reduce((sum, tx) => {
      return tx.status === 'completed' ? sum + tx.amount : sum
    }, 0) || 0

    // Group by month/quarter/year
    const monthlyRevenue: Record<string, { revenue: number; campaigns: Set<string> }> = {}
    
    transactions?.forEach(tx => {
      if (tx.status === 'completed') {
        const date = new Date(tx.created_at)
        let key: string
        
        if (period === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        } else if (period === 'quarter') {
          key = `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`
        } else {
          key = String(date.getFullYear())
        }
        
        if (!monthlyRevenue[key]) {
          monthlyRevenue[key] = { revenue: 0, campaigns: new Set() }
        }
        
        monthlyRevenue[key].revenue += tx.amount
        if (tx.submission_id) {
          monthlyRevenue[key].campaigns.add(tx.submission_id)
        }
      }
    })

    // Convert to array format
    const monthlyData = Object.entries(monthlyRevenue).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      campaigns: data.campaigns.size
    }))

    // Payment method distribution
    const paymentMethodDistribution: Record<string, { count: number; amount: number }> = {}
    
    transactions?.forEach(tx => {
      if (tx.status === 'completed' && tx.payment_methods) {
        const method = tx.payment_methods.type
        if (!paymentMethodDistribution[method]) {
          paymentMethodDistribution[method] = { count: 0, amount: 0 }
        }
        paymentMethodDistribution[method].count += 1
        paymentMethodDistribution[method].amount += tx.amount
      }
    })

    // Calculate fees (simplified)
    const platformFees = totalRevenue * 0.10 // 10% platform fee
    const processingFees = totalRevenue * 0.02 // Average 2% processing fee
    const netRevenue = totalRevenue - platformFees - processingFees

    const analytics: RevenueAnalytics = {
      totalRevenue,
      monthlyRevenue: monthlyData,
      paymentMethodDistribution,
      platformFees,
      processingFees,
      netRevenue
    }

    return { success: true, data: analytics }
  } catch (error) {
    console.error('Get revenue analytics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get performance metrics for influencers
export async function getPerformanceMetrics() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isInfluencer = userData?.role === 'influencer'
    const isBrand = userData?.role === 'brand'

    if (isInfluencer) {
      // Get influencer's own performance
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select(`
          *,
          campaigns(title, budget_amount)
        `)
        .eq('influencer_id', user.id)

      if (subError) {
        return { success: false, error: 'Failed to fetch performance data' }
      }

      const totalSubmissions = submissions?.length || 0
      const approvedSubmissions = submissions?.filter(s => s.status === 'approved').length || 0
      const totalEngagement = submissions?.reduce((sum, s) => {
        if (s.metrics) {
          const metrics = s.metrics as any
          return sum + (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
        }
        return sum
      }, 0) || 0

      // Calculate average engagement rate
      const averageEngagementRate = submissions && submissions.length > 0
        ? submissions.reduce((sum, s) => {
            if (s.metrics && (s.metrics as any).engagement_rate) {
              return sum + (s.metrics as any).engagement_rate
            }
            return sum
          }, 0) / submissions.length
        : 0

      // Get active campaigns
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('campaign_id, campaigns(status)')
        .eq('influencer_id', user.id)
        .eq('status', 'approved')

      const activeCampaigns = applications?.filter(app => 
        app.campaigns?.status === 'active'
      ).length || 0

      const metrics: PerformanceMetrics = {
        totalCampaigns: applications?.length || 0,
        activeCampaigns,
        completedCampaigns: totalSubmissions,
        averageEngagementRate,
        averageROI: approvedSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0,
        topPerformingInfluencers: [] // Not applicable for influencer view
      }

      return { success: true, data: metrics }
    } else if (isBrand) {
      // Get brand's campaign performance
      const { data: campaigns, error: campaignError } = await supabase
        .from('campaigns')
        .select(`
          id,
          status,
          submissions(
            id,
            status,
            influencer_id,
            metrics,
            users(full_name),
            influencer_profiles(username)
          )
        `)
        .eq('brand_id', user.id)

      if (campaignError) {
        return { success: false, error: 'Failed to fetch campaign data' }
      }

      const totalCampaigns = campaigns?.length || 0
      const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0
      const completedCampaigns = campaigns?.filter(c => c.status === 'completed').length || 0

      // Calculate influencer performance scores
      const influencerStats: Record<string, {
        id: string
        name: string
        submissions: number
        approved: number
        totalEngagement: number
      }> = {}

      campaigns?.forEach(campaign => {
        campaign.submissions?.forEach(submission => {
          const influencerId = submission.influencer_id
          if (!influencerStats[influencerId]) {
            influencerStats[influencerId] = {
              id: influencerId,
              name: submission.users?.full_name || submission.influencer_profiles?.username || 'Unknown',
              submissions: 0,
              approved: 0,
              totalEngagement: 0
            }
          }
          
          influencerStats[influencerId].submissions += 1
          if (submission.status === 'approved') {
            influencerStats[influencerId].approved += 1
          }
          
          if (submission.metrics) {
            const metrics = submission.metrics as any
            influencerStats[influencerId].totalEngagement += 
              (metrics.likes || 0) + (metrics.comments || 0) + (metrics.shares || 0)
          }
        })
      })

      // Calculate top performers
      const topPerformingInfluencers = Object.values(influencerStats)
        .map(influencer => ({
          ...influencer,
          score: influencer.submissions > 0 
            ? (influencer.approved / influencer.submissions) * 50 + 
              Math.min(influencer.totalEngagement / 1000, 50)
            : 0,
          approvalRate: influencer.submissions > 0 
            ? (influencer.approved / influencer.submissions) * 100 
            : 0
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)

      // Calculate overall metrics
      const allSubmissions = campaigns?.flatMap(c => c.submissions || []) || []
      const averageEngagementRate = allSubmissions.length > 0
        ? allSubmissions.reduce((sum, s) => {
            if (s.metrics && (s.metrics as any).engagement_rate) {
              return sum + (s.metrics as any).engagement_rate
            }
            return sum
          }, 0) / allSubmissions.length
        : 0

      const metrics: PerformanceMetrics = {
        totalCampaigns,
        activeCampaigns,
        completedCampaigns,
        averageEngagementRate,
        averageROI: 0, // Would need revenue data to calculate
        topPerformingInfluencers
      }

      return { success: true, data: metrics }
    } else {
      return { success: false, error: 'Invalid user role for performance metrics' }
    }
  } catch (error) {
    console.error('Get performance metrics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get dashboard overview data
export async function getDashboardOverview() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = userData?.role

    if (userRole === 'influencer') {
      // Influencer dashboard overview
      const [campaignsResult, submissionsResult, earningsResult] = await Promise.all([
        supabase
          .from('applications')
          .select('status, campaigns(title, budget_amount)')
          .eq('influencer_id', user.id),
        supabase
          .from('submissions')
          .select('status, metrics, created_at')
          .eq('influencer_id', user.id),
        supabase
          .from('transactions')
          .select('amount, status, created_at')
          .eq('user_id', user.id)
          .eq('type', 'payout')
      ])

      const campaigns = campaignsResult.data || []
      const submissions = submissionsResult.data || []
      const earnings = earningsResult.data || []

      // Calculate this month's data
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const thisMonthSubmissions = submissions.filter(s => 
        new Date(s.created_at) >= thisMonth
      )
      
      const thisMonthEarnings = earnings
        .filter(t => new Date(t.created_at) >= thisMonth && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        success: true,
        data: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'approved').length,
          totalSubmissions: submissions.length,
          thisMonthSubmissions: thisMonthSubmissions.length,
          totalEarnings: earnings
            .filter(t => t.status === 'completed')
            .reduce((sum, t) => sum + t.amount, 0),
          thisMonthEarnings,
          pendingPayouts: earnings
            .filter(t => t.status === 'pending' || t.status === 'processing')
            .reduce((sum, t) => sum + t.amount, 0),
          averageEngagementRate: submissions.length > 0
            ? submissions.reduce((sum, s) => {
                return sum + ((s.metrics as any)?.engagement_rate || 0)
              }, 0) / submissions.length
            : 0
        }
      }
    } else if (userRole === 'brand') {
      // Brand dashboard overview
      const [campaignsResult, applicationsResult, submissionsResult, paymentsResult] = await Promise.all([
        supabase
          .from('campaigns')
          .select('status, budget_amount, created_at')
          .eq('brand_id', user.id),
        supabase
          .from('applications')
          .select('status, campaigns!inner(brand_id)')
          .eq('campaigns.brand_id', user.id),
        supabase
          .from('submissions')
          .select('status, campaigns!inner(brand_id), metrics')
          .eq('campaigns.brand_id', user.id),
        supabase
          .from('transactions')
          .select('amount, status, created_at, campaigns!inner(brand_id)')
          .eq('campaigns.brand_id', user.id)
      ])

      const campaigns = campaignsResult.data || []
      const applications = applicationsResult.data || []
      const submissions = submissionsResult.data || []

      // Calculate this month's data
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      
      const thisMonthCampaigns = campaigns.filter(c => 
        new Date(c.created_at) >= thisMonth
      )

      return {
        success: true,
        data: {
          totalCampaigns: campaigns.length,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length,
          thisMonthCampaigns: thisMonthCampaigns.length,
          totalApplications: applications.length,
          pendingApplications: applications.filter(a => a.status === 'pending').length,
          totalSubmissions: submissions.length,
          pendingReviews: submissions.filter(s => s.status === 'pending_review').length,
          totalBudget: campaigns.reduce((sum, c) => sum + c.budget_amount, 0),
          averageEngagementRate: submissions.length > 0
            ? submissions.reduce((sum, s) => {
                return sum + ((s.metrics as any)?.engagement_rate || 0)
              }, 0) / submissions.length
            : 0
        }
      }
    } else {
      return { success: false, error: 'Invalid user role' }
    }
  } catch (error) {
    console.error('Get dashboard overview error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Export analytics data
export async function exportAnalyticsData(
  type: 'campaigns' | 'revenue' | 'performance',
  format: 'csv' | 'json' = 'csv',
  filters?: any
) {
  try {
    let data: any[] = []
    
    switch (type) {
      case 'campaigns':
        const campaignResult = await getCampaignAnalytics(filters)
        if (campaignResult.success) {
          data = campaignResult.data || []
        }
        break
      case 'revenue':
        const revenueResult = await getRevenueAnalytics()
        if (revenueResult.success) {
          data = revenueResult.data?.monthlyRevenue || []
        }
        break
      case 'performance':
        const performanceResult = await getPerformanceMetrics()
        if (performanceResult.success) {
          data = [performanceResult.data]
        }
        break
    }

    if (format === 'csv') {
      // Convert to CSV format
      if (data.length === 0) {
        return { success: true, data: 'No data available' }
      }
      
      const headers = Object.keys(data[0])
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            return typeof value === 'string' ? `"${value}"` : value
          }).join(',')
        )
      ].join('\n')
      
      return { success: true, data: csvContent, filename: `${type}-analytics.csv` }
    } else {
      return { success: true, data: JSON.stringify(data, null, 2), filename: `${type}-analytics.json` }
    }
  } catch (error) {
    console.error('Export analytics error:', error)
    return { success: false, error: 'Failed to export data' }
  }
}