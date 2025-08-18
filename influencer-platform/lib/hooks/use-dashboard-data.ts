'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DashboardStats {
  activeCampaigns?: number
  pendingApplications?: number
  activeApplications?: number
  pendingSubmissions?: number
  totalUsers?: number
}

interface UseDashboardDataProps {
  userId?: string
  role?: string
}

// Cache for dashboard data
const dataCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 300000 // 5 minute cache (increased from 1 minute)

export function useDashboardData({ userId, role }: UseDashboardDataProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!userId || !role) {
      setLoading(false)
      return
    }

    const cacheKey = `dashboard-${userId}`
    const cached = dataCache.get(cacheKey)
    
    // Use cached data if available and fresh
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setNotifications(cached.data.notifications)
      setStats(cached.data.stats)
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        // Set loading to false immediately for better UX, fetch in background
        setLoading(false)
        
        // Fetch notifications with optimized query
        const { data: notificationData } = await supabase
          .from('notifications')
          .select('id, title, message, type, created_at')  // Only select needed fields
          .eq('user_id', userId)
          .eq('read', false)
          .order('created_at', { ascending: false })
          .limit(3)  // Reduced from 5 to 3 for faster loading
        
        const fetchedNotifications = notificationData || []
        
        // Fetch stats based on role
        let fetchedStats: DashboardStats = {}
        
        if (role === 'brand') {
          const [campaignsRes, applicationsRes] = await Promise.all([
            supabase
              .from('campaigns')
              .select('id, status')
              .eq('brand_id', userId),
            supabase
              .from('campaign_applications')
              .select('id, campaigns!inner(brand_id)')
              .eq('campaigns.brand_id', userId)
              .eq('status', 'pending')
          ])
          
          fetchedStats = {
            activeCampaigns: campaignsRes.data?.filter(c => c.status === 'active').length || 0,
            pendingApplications: applicationsRes.data?.length || 0
          }
        } else if (role === 'influencer') {
          const [applicationsRes, submissionsRes] = await Promise.all([
            supabase
              .from('campaign_applications')
              .select('id, status')
              .eq('influencer_id', userId),
            supabase
              .from('submissions')
              .select('id, status')
              .eq('influencer_id', userId)
              .eq('status', 'pending_review')
          ])
          
          fetchedStats = {
            activeApplications: applicationsRes.data?.filter(a => a.status === 'approved').length || 0,
            pendingSubmissions: submissionsRes.data?.length || 0
          }
        } else if (role === 'admin') {
          // Use count queries instead of fetching all records for better performance
          const [usersRes, campaignsRes] = await Promise.all([
            supabase
              .from('user_profiles')
              .select('*', { count: 'exact', head: true })
              .neq('role', 'admin'),
            supabase
              .from('campaigns')
              .select('*', { count: 'exact', head: true })
              .eq('status', 'active')
          ])
          
          fetchedStats = {
            totalUsers: usersRes.count || 0,
            activeCampaigns: campaignsRes.count || 0
          }
        }
        
        // Update state
        setNotifications(fetchedNotifications)
        setStats(fetchedStats)
        
        // Update cache
        dataCache.set(cacheKey, {
          data: { notifications: fetchedNotifications, stats: fetchedStats },
          timestamp: Date.now()
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, role])

  return { notifications, stats, loading }
}