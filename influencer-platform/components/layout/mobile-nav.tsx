'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { 
  Menu,
  X,
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
  Shield
} from 'lucide-react'

interface MobileNavItem {
  href: string
  label: string
  icon: React.ComponentType<any>
}

export function MobileNav() {
  const { user, role, loading } = useAuth()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const getMobileNavItems = (): MobileNavItem[] => {
    if (!user) return []

    switch (role) {
      case 'influencer':
        return [
          { href: '/influencer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/influencer/campaigns', label: 'Campaigns', icon: Target },
          { href: '/influencer/earnings', label: 'Earnings', icon: DollarSign },
          { href: '/influencer/profile', label: 'Profile', icon: User },
          { href: '/influencer/settings', label: 'Settings', icon: Settings },
        ]
      case 'brand':
        return [
          { href: '/brand/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/brand/campaigns', label: 'Campaigns', icon: Target },
          { href: '/brand/applications', label: 'Applications', icon: Users },
          { href: '/brand/analytics', label: 'Analytics', icon: BarChart3 },
          { href: '/brand/payments', label: 'Payments', icon: CreditCard },
          { href: '/brand/profile', label: 'Profile', icon: Building2 },
          { href: '/brand/settings', label: 'Settings', icon: Settings },
        ]
      case 'admin':
        return [
          { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { href: '/admin/users', label: 'Users', icon: Users },
          { href: '/admin/campaigns', label: 'Campaigns', icon: Target },
          { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
          { href: '/admin/settings', label: 'Settings', icon: Shield },
        ]
      default:
        return []
    }
  }

  const navItems = getMobileNavItems()

  if (loading || !user) {
    return null
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 bg-white shadow-lg"
        >
          <span className="sr-only">Open main menu</span>
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-xl font-bold text-primary-600">
                    {role === 'influencer' && '✨ Influencer'}
                    {role === 'brand' && '🏢 Brand'}
                    {role === 'admin' && '👑 Admin'}
                  </span>
                </div>
                
                <nav className="mt-5 px-2 space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? 'bg-primary-100 text-primary-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon
                          className={`mr-4 flex-shrink-0 h-6 w-6 ${
                            isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                          }`}
                        />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
              
              {/* User info at bottom */}
              <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-900">
                      {user.profile?.full_name || 'User'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}