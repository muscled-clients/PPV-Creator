'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  Activity,
  MessageSquare,
  Calendar,
  TrendingUp,
  Package,
  Heart,
  Star,
  Camera,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Sparkles,
  Crown,
  Zap,
  Gift
} from 'lucide-react'

interface SidebarItem {
  href: string
  label: string
  icon: React.ComponentType<any>
  badge?: number | string
  color?: string
}

interface SidebarProps {
  isOpen: boolean
  onClose?: () => void
}

export function SidebarNew({ isOpen, onClose }: SidebarProps) {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [stats, setStats] = useState<any>({})
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    if (user) {
      getUserStats()
    }
  }, [user])

  const getUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single()
        
        setUser({ ...authUser, ...profile })
      }
    } catch (error) {
      console.error('Error fetching user:', error)
    }
  }

  const getUserStats = async () => {
    try {
      if (user?.role === 'brand') {
        const { data: campaigns } = await supabase
          .from('campaigns')
          .select('id, status')
          .eq('brand_id', user.id)
        
        const { data: applications } = await supabase
          .from('campaign_applications')
          .select('id, campaigns!inner(brand_id)')
          .eq('campaigns.brand_id', user.id)
          .eq('status', 'pending')

        setStats({
          activeCampaigns: campaigns?.filter(c => c.status === 'active').length || 0,
          pendingApplications: applications?.length || 0
        })
      } else if (user?.role === 'influencer') {
        const { data: applications } = await supabase
          .from('campaign_applications')
          .select('id, status')
          .eq('influencer_id', user.id)

        setStats({
          activeApplications: applications?.filter(a => a.status === 'approved').length || 0,
          pendingSubmissions: 0
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const getSidebarItems = (): SidebarItem[] => {
    if (!user) return []

    switch (user.role) {
      case 'influencer':
        return [
          { 
            href: '/influencer/dashboard', 
            label: 'Dashboard', 
            icon: LayoutDashboard,
            color: 'text-purple-600'
          },
          { 
            href: '/influencer/campaigns', 
            label: 'Browse Campaigns', 
            icon: Target,
            badge: 'NEW',
            color: 'text-blue-600'
          },
          { 
            href: '/influencer/applications', 
            label: 'My Applications', 
            icon: FileText,
            badge: stats.activeApplications > 0 ? stats.activeApplications : undefined,
            color: 'text-green-600'
          },
          { 
            href: '/influencer/earnings', 
            label: 'Earnings', 
            icon: DollarSign,
            color: 'text-green-600'
          },
          { 
            href: '/influencer/analytics', 
            label: 'Analytics', 
            icon: TrendingUp,
            color: 'text-indigo-600'
          },
          { 
            href: '/influencer/messages', 
            label: 'Messages', 
            icon: MessageSquare,
            color: 'text-blue-600'
          },
          { 
            href: '/influencer/calendar', 
            label: 'Calendar', 
            icon: Calendar,
            color: 'text-orange-600'
          },
          { 
            href: '/influencer/profile', 
            label: 'Profile', 
            icon: User,
            color: 'text-gray-600'
          },
          { 
            href: '/influencer/settings', 
            label: 'Settings', 
            icon: Settings,
            color: 'text-gray-600'
          },
        ]
      case 'brand':
        return [
          { 
            href: '/brand/dashboard', 
            label: 'Dashboard', 
            icon: LayoutDashboard,
            color: 'text-blue-600'
          },
          { 
            href: '/brand/campaigns', 
            label: 'My Campaigns', 
            icon: Target,
            badge: stats.activeCampaigns > 0 ? stats.activeCampaigns : undefined,
            color: 'text-purple-600'
          },
          { 
            href: '/brand/applications', 
            label: 'Applications', 
            icon: Users,
            badge: stats.pendingApplications > 0 ? stats.pendingApplications : undefined,
            color: 'text-green-600'
          },
          { 
            href: '/brand/influencers', 
            label: 'Find Influencers', 
            icon: Star,
            badge: 'PRO',
            color: 'text-yellow-600'
          },
          { 
            href: '/brand/analytics', 
            label: 'Analytics', 
            icon: BarChart3,
            color: 'text-indigo-600'
          },
          { 
            href: '/brand/payments', 
            label: 'Payments', 
            icon: CreditCard,
            color: 'text-green-600'
          },
          { 
            href: '/brand/messages', 
            label: 'Messages', 
            icon: MessageSquare,
            color: 'text-blue-600'
          },
          { 
            href: '/brand/calendar', 
            label: 'Calendar', 
            icon: Calendar,
            color: 'text-orange-600'
          },
          { 
            href: '/brand/profile', 
            label: 'Company Profile', 
            icon: Building2,
            color: 'text-gray-600'
          },
          { 
            href: '/brand/settings', 
            label: 'Settings', 
            icon: Settings,
            color: 'text-gray-600'
          },
        ]
      case 'admin':
        return [
          { 
            href: '/admin/dashboard', 
            label: 'Dashboard', 
            icon: LayoutDashboard,
            color: 'text-purple-600'
          },
          { 
            href: '/admin/users', 
            label: 'User Management', 
            icon: Users,
            color: 'text-blue-600'
          },
          { 
            href: '/admin/campaigns', 
            label: 'Campaign Review', 
            icon: Target,
            color: 'text-green-600'
          },
          { 
            href: '/admin/reports', 
            label: 'Reports', 
            icon: BarChart3,
            color: 'text-indigo-600'
          },
          { 
            href: '/admin/settings', 
            label: 'System Settings', 
            icon: Shield,
            color: 'text-gray-600'
          },
        ]
      default:
        return []
    }
  }

  const getRoleConfig = () => {
    switch (user?.role) {
      case 'influencer':
        return {
          icon: Sparkles,
          color: 'from-purple-500 to-pink-500',
          bgColor: 'bg-purple-50',
          title: 'Influencer Hub'
        }
      case 'brand':
        return {
          icon: Building2,
          color: 'from-blue-500 to-indigo-500',
          bgColor: 'bg-blue-50',
          title: 'Brand Center'
        }
      case 'admin':
        return {
          icon: Crown,
          color: 'from-yellow-500 to-orange-500',
          bgColor: 'bg-yellow-50',
          title: 'Admin Panel'
        }
      default:
        return {
          icon: User,
          color: 'from-gray-500 to-gray-600',
          bgColor: 'bg-gray-50',
          title: 'Dashboard'
        }
    }
  }

  const sidebarItems = getSidebarItems()
  const roleConfig = getRoleConfig()
  const RoleIcon = roleConfig.icon

  if (!user) return null

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] 
          bg-white border-r border-gray-200
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${collapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className={`p-4 border-b border-gray-200 ${roleConfig.bgColor}`}>
            <div className="flex items-center justify-between">
              <div className={`flex items-center ${collapsed ? 'justify-center' : ''}`}>
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleConfig.color} flex items-center justify-center`}>
                  <RoleIcon className="w-6 h-6 text-white" />
                </div>
                {!collapsed && (
                  <div className="ml-3">
                    <h3 className="text-sm font-semibold text-gray-900">{roleConfig.title}</h3>
                    <p className="text-xs text-gray-500">{user.full_name || 'User'}</p>
                  </div>
                )}
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="hidden lg:block p-1 hover:bg-white/50 rounded-lg transition"
              >
                {collapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-3 py-2.5 rounded-lg
                        transition-all duration-200
                        ${isActive 
                          ? 'bg-gradient-to-r ' + roleConfig.color + ' text-white shadow-lg transform scale-105' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                        ${collapsed ? 'justify-center' : ''}
                      `}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose?.()
                        }
                      }}
                    >
                      <Icon className={`
                        flex-shrink-0 w-5 h-5
                        ${isActive ? 'text-white' : item.color || 'text-gray-500'}
                      `} />
                      {!collapsed && (
                        <>
                          <span className={`ml-3 flex-1 ${isActive ? 'font-medium' : ''}`}>
                            {item.label}
                          </span>
                          {item.badge && (
                            <span className={`
                              ml-2 px-2 py-0.5 text-xs rounded-full font-medium
                              ${typeof item.badge === 'number' 
                                ? 'bg-red-100 text-red-600' 
                                : item.badge === 'NEW' 
                                  ? 'bg-green-100 text-green-600'
                                  : item.badge === 'PRO'
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                                    : 'bg-gray-100 text-gray-600'
                              }
                            `}>
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className={`space-y-2 ${collapsed ? 'flex flex-col items-center' : ''}`}>
              <Link
                href="/help"
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <HelpCircle className="w-5 h-5" />
                {!collapsed && <span className="ml-3">Help & Support</span>}
              </Link>
              
              {/* Upgrade banner (for non-admin users) */}
              {!collapsed && user.role !== 'admin' && (
                <div className="mt-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <div className="flex items-center text-white">
                    <Zap className="w-5 h-5" />
                    <div className="ml-2">
                      <p className="text-xs font-semibold">Upgrade to Pro</p>
                      <p className="text-xs opacity-90">Unlock all features</p>
                    </div>
                  </div>
                  <button className="mt-2 w-full bg-white text-purple-600 px-3 py-1 rounded text-xs font-semibold hover:bg-gray-100 transition">
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}