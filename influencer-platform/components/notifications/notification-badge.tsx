'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NotificationBadgeProps {
  userId: string
  className?: string
}

export function NotificationBadge({ userId, className = '' }: NotificationBadgeProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

      if (!error && count !== null) {
        setUnreadCount(count)
      }
    }

    fetchUnreadCount()

    // Subscribe to notification changes
    const channel = supabase
      .channel(`notifications-badge-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        async () => {
          // Refetch count on any notification change
          await fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (unreadCount === 0) return null

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full ${className}`}>
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )
}