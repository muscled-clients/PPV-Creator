'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, X, Trash2, Bell, BellOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface NotificationActionsProps {
  notificationId: string
  isRead: boolean
  onUpdate?: () => void
}

export function NotificationActions({ notificationId, isRead, onUpdate }: NotificationActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleMarkAsRead = async () => {
    if (isRead) return
    
    // Skip for demo notifications
    if (notificationId.startsWith('demo-')) {
      alert('Demo notifications cannot be modified. Create real notifications to test this feature.')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Update error:', error)
        alert('Failed to update notification. Please ensure the notifications table exists.')
        throw error
      }
      
      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsUnread = async () => {
    if (!isRead) return
    
    // Skip for demo notifications
    if (notificationId.startsWith('demo-')) {
      alert('Demo notifications cannot be modified. Create real notifications to test this feature.')
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: false })
        .eq('id', notificationId)

      if (error) {
        console.error('Update error:', error)
        alert('Failed to update notification. Please ensure the notifications table exists.')
        throw error
      }
      
      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Error marking notification as unread:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // Skip delete for demo notifications
    if (notificationId.startsWith('demo-')) {
      alert('Demo notifications cannot be deleted. Create real notifications to test this feature.')
      return
    }
    
    if (!confirm('Are you sure you want to delete this notification?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Delete error:', error)
        alert('Failed to delete notification. Please ensure the notifications table exists.')
        throw error
      }
      
      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Error deleting notification:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {!isRead ? (
        <button
          onClick={handleMarkAsRead}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handleMarkAsUnread}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
          title="Mark as unread"
        >
          <BellOff className="w-4 h-4" />
        </button>
      )}
      
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
        title="Delete notification"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

interface MarkAllReadButtonProps {
  userId: string
  onUpdate?: () => void
}

export function MarkAllReadButton({ userId, onUpdate }: MarkAllReadButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleMarkAllRead = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (error) throw error
      
      if (onUpdate) onUpdate()
      router.refresh()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkAllRead}
      disabled={loading}
      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
    >
      <Check className="w-4 h-4 mr-2" />
      {loading ? 'Updating...' : 'Mark All Read'}
    </button>
  )
}

interface NotificationFilterProps {
  currentCategory: string
  onCategoryChange: (category: string) => void
}

export function NotificationFilter({ currentCategory, onCategoryChange }: NotificationFilterProps) {
  const categories = [
    { value: 'all', label: 'All' },
    { value: 'application', label: 'Applications' },
    { value: 'campaign', label: 'Campaigns' },
    { value: 'payment', label: 'Payments' },
    { value: 'message', label: 'Messages' },
    { value: 'system', label: 'System' }
  ]

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onCategoryChange(cat.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            currentCategory === cat.value
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}