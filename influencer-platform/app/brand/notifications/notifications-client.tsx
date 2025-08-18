'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Bell, Clock, Users, DollarSign, Target, MessageSquare, 
  Settings, CheckCircle, X 
} from 'lucide-react'
import { NotificationActions, MarkAllReadButton, NotificationFilter } from '@/components/notifications/notification-actions'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  category: string
  read: boolean
  created_at: string
  action_url?: string
  data?: any
}

interface NotificationsClientProps {
  notifications: Notification[]
  userId: string
}

export function NotificationsClient({ notifications: initialNotifications, userId }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState(initialNotifications)
  const [currentCategory, setCurrentCategory] = useState('all')

  const getNotificationIcon = (category: string) => {
    switch(category) {
      case 'application': return Users
      case 'payment': return DollarSign
      case 'campaign': return Target
      case 'message': return MessageSquare
      case 'system': return Settings
      default: return Bell
    }
  }

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return 'text-green-600 bg-green-100'
      case 'warning': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'info': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  useEffect(() => {
    if (currentCategory === 'all') {
      setFilteredNotifications(notifications)
    } else {
      setFilteredNotifications(notifications.filter(n => n.category === currentCategory))
    }
  }, [currentCategory, notifications])

  const handleNotificationUpdate = () => {
    // Refresh notifications list
    window.location.reload()
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const todayCount = notifications.filter(n => {
    const date = new Date(n.created_at)
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }).length

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
              <p className="text-xs text-gray-600">Unread</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-2xl font-bold text-gray-900">{todayCount}</p>
              <p className="text-xs text-gray-600">Today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Actions */}
      <div className="flex justify-between items-center">
        <NotificationFilter 
          currentCategory={currentCategory} 
          onCategoryChange={setCurrentCategory} 
        />
        {unreadCount > 0 && (
          <MarkAllReadButton userId={userId} onUpdate={handleNotificationUpdate} />
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => {
            const Icon = getNotificationIcon(notification.category)
            const colorClass = getNotificationColor(notification.type)
            const timeAgo = formatTimeAgo(notification.created_at)
            
            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm border ${
                  notification.read ? 'border-gray-200' : 'border-blue-200 bg-blue-50/30'
                } p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start">
                  <div className={`p-2 rounded-lg ${colorClass} mr-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {notification.title}
                          {!notification.read && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="w-3 h-3 mr-1" />
                          {timeAgo}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {notification.action_url && (
                          <Link
                            href={notification.action_url}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View
                          </Link>
                        )}
                        <NotificationActions
                          notificationId={notification.id}
                          isRead={notification.read}
                          onUpdate={handleNotificationUpdate}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentCategory === 'all' ? 'No notifications yet' : `No ${currentCategory} notifications`}
            </h3>
            <p className="text-gray-600">
              {currentCategory === 'all' 
                ? "We'll notify you when there's something new"
                : `You don't have any ${currentCategory} notifications`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}