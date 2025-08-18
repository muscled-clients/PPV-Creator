'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { 
  LayoutDashboard,
  Target,
  FileText,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Activity
} from 'lucide-react'

interface SidebarItem {
  href: string
  label: string
  icon: React.ComponentType<any>
  badge?: number
}

export function Sidebar() {
  const { user, role, loading } = useAuth()
  const pathname = usePathname()

  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return []

    switch (role) {
      case 'influencer':
        return [
          { href: '/influencer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/influencer/campaigns', label: 'Browse Campaigns', icon: Target },
          { href: '/influencer/applications', label: 'My Applications', icon: FileText },
          { href: '/influencer/earnings', label: 'Earnings', icon: DollarSign },
          { href: '/influencer/profile', label: 'Profile', icon: User },
          { href: '/influencer/settings', label: 'Settings', icon: Settings },
        ]
      case 'brand':
        return [
          { href: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/brand/campaigns', label: 'My Campaigns', icon: Target },
          { href: '/brand/applications', label: 'Applications', icon: Users },
          { href: '/brand/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/brand/payments', label: 'Payments', icon: CreditCard },
          { href: '/brand/profile', label: 'Profile', icon: Building2 },
          { href: '/brand/settings', label: 'Settings', icon: Settings },
        ]
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'User Management', icon: Users },
          { href: '/admin/campaigns', label: 'Campaign Review', icon: Target },
          { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
          { href: '/admin/settings', label: 'System Settings', icon: Shield },
        ]
      default:
        return []
    }
  }

  const sidebarItems = getSidebarItems()

  if (loading || !user) {
    return null
  }

  return (
    <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-bold text-primary-600">
              {role === 'influencer' && '✨ Influencer'}
              {role === 'brand' && '🏢 Brand'}
              {role === 'admin' && '👑 Admin'}
            </span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto inline-block py-0.5 px-2 text-xs rounded-full bg-red-100 text-red-600">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* User info at bottom */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}