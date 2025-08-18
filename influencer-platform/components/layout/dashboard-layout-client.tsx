'use client'

import { useState } from 'react'
import { HeaderOptimized } from './header-optimized'
import { SidebarOptimized } from './sidebar-optimized'

interface DashboardLayoutClientProps {
  user: any
  notifications: any[]
  stats: any
  children: React.ReactNode
}

export function DashboardLayoutClient({ 
  user, 
  notifications, 
  stats, 
  children 
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
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
      <main className="pt-16 lg:pl-64 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}