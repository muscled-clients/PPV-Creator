'use client'

import { useState, useEffect } from 'react'
import { HeaderOptimized } from './header-optimized'
import { SidebarOptimized } from './sidebar-optimized'
import { PageLoadingIndicator, DataLoadingOverlay } from '@/components/ui/page-loading'
import { useDashboardData } from '@/lib/hooks/use-dashboard-data'

interface DashboardLayoutClientOptimizedProps {
  user: any
  children: React.ReactNode
}

export function DashboardLayoutClientOptimized({ 
  user, 
  children 
}: DashboardLayoutClientOptimizedProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Fetch dashboard data client-side with caching
  const { notifications, stats, loading } = useDashboardData({
    userId: user?.id,
    role: user?.role
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Loading Indicator */}
      <PageLoadingIndicator />
      
      {/* Header */}
      <HeaderOptimized 
        user={user}
        notifications={notifications}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      
      {/* Sidebar */}
      <SidebarOptimized 
        user={user}
        stats={stats}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <main className="pt-16 lg:pl-64 transition-all duration-300 relative">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
        {/* Data loading overlay for when dashboard data is loading */}
        <DataLoadingOverlay 
          loading={loading} 
          message="Loading dashboard data..."
        />
      </main>
    </div>
  )
}