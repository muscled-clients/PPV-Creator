'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Plus,
  Sparkles,
  Building2,
  Crown
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { HeaderSearch } from '@/components/search/header-search'

interface HeaderOptimizedProps {
  user: any
  notifications: any[]
  onMenuClick: () => void
  isSidebarOpen?: boolean
}

export function HeaderOptimized({ 
  user, 
  notifications: initialNotifications, 
  onMenuClick, 
  isSidebarOpen 
}: HeaderOptimizedProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return date.toLocaleDateString()
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Use window.location for a full page reload to clear all state
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const markNotificationAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
    
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const getQuickAction = () => {
    if (!user) return null

    switch (user.role) {
      case 'brand':
        return (
          <Link
            href="/brand/campaigns/create"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg transform transition hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Link>
        )
      case 'influencer':
        return (
          <Link
            href="/influencer/campaigns"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center shadow-lg transform transition hover:scale-105"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Find Campaigns
          </Link>
        )
      default:
        return null
    }
  }

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'influencer':
        return <Sparkles className="w-5 h-5 text-purple-500" />
      case 'brand':
        return <Building2 className="w-5 h-5 text-blue-500" />
      case 'admin':
        return <Crown className="w-5 h-5 text-yellow-500" />
      default:
        return <User className="w-5 h-5 text-gray-500" />
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            {/* Menu button for mobile */}
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            >
              {isSidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Logo */}
            <Link href={user ? `/${user.role}/dashboard` : '/'} className="flex items-center">
              <div className="ml-2 lg:ml-0 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IP</span>
                </div>
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                  Influencer Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center - Search (desktop) */}
          {user && (
            <div className="hidden lg:block flex-1 max-w-lg mx-8">
              <HeaderSearch 
                userRole={user.role}
                placeholder={user.role === 'brand' ? 'Search campaigns, influencers...' : 'Search campaigns, brands...'}
              />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Quick action button */}
                <div className="hidden sm:block">
                  {getQuickAction()}
                </div>

                {/* Search button (mobile) */}
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
                >
                  <Search className="h-5 w-5" />
                </button>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>

                  {notificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      </div>
                      {notifications.length > 0 ? (
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatRelativeTime(notification.created_at)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                      )}
                      <div className="px-4 py-2 border-t border-gray-200">
                        <Link
                          href={`/${user.role}/notifications`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name || 'User'}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                      <div className="hidden md:block text-left max-w-[150px]">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 flex items-center">
                          {getRoleIcon()}
                          <span className="ml-1 capitalize truncate">{user.role}</span>
                        </p>
                      </div>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                      
                      {user.role !== 'admin' && (
                        <>
                          <Link
                            href={`/${user.role}/profile`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <User className="h-4 w-4 mr-3 text-gray-400" />
                            Your Profile
                          </Link>
                          
                          <Link
                            href={`/${user.role}/settings`}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            <Settings className="h-4 w-4 mr-3 text-gray-400" />
                            Account Settings
                          </Link>
                        </>
                      )}
                      
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Auth links for non-authenticated users */
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      {searchOpen && user && (
        <div className="lg:hidden border-t border-gray-200 p-4">
          <HeaderSearch 
            userRole={user.role}
            placeholder={user.role === 'brand' ? 'Search campaigns, influencers...' : 'Search campaigns, brands...'}
          />
        </div>
      )}

      {/* Click outside handlers */}
      {profileMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setProfileMenuOpen(false)}
        />
      )}
      {notificationOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setNotificationOpen(false)}
        />
      )}
    </header>
  )
}