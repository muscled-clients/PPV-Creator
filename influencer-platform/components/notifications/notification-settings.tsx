'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Mail, MessageSquare, DollarSign, Target, Users, Settings as SettingsIcon } from 'lucide-react'

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  application_notifications: boolean
  campaign_notifications: boolean
  payment_notifications: boolean
  message_notifications: boolean
  system_notifications: boolean
}

interface NotificationSettingsProps {
  userId: string
}

export function NotificationSettings({ userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    application_notifications: true,
    campaign_notifications: true,
    payment_notifications: true,
    message_notifications: true,
    system_notifications: true
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Load preferences from user profile or a separate preferences table
    const loadPreferences = async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single()

      if (!error && data?.notification_preferences) {
        setPreferences(data.notification_preferences)
      }
    }

    loadPreferences()
  }, [userId])

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    setLoading(true)
    setSaved(false)

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          notification_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const requestPushPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPreferences(prev => ({ ...prev, push_notifications: true }))
        new Notification('Notifications Enabled!', {
          body: 'You will now receive push notifications',
          icon: '/favicon.ico'
        })
      } else {
        setPreferences(prev => ({ ...prev, push_notifications: false }))
      }
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
      
      {/* General Settings */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">General</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <Mail className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('email_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.email_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.email_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <Bell className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Receive browser push notifications</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!preferences.push_notifications && 'Notification' in window) {
                if (Notification.permission === 'default') {
                  requestPushPermission()
                } else if (Notification.permission === 'granted') {
                  handleToggle('push_notifications')
                } else {
                  alert('Please enable notifications in your browser settings')
                }
              } else {
                handleToggle('push_notifications')
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.push_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.push_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Types */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wider">Notification Types</h3>
        
        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Applications</p>
              <p className="text-sm text-gray-600">New applications and status updates</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('application_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.application_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.application_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <Target className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Campaigns</p>
              <p className="text-sm text-gray-600">Campaign updates and milestones</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('campaign_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.campaign_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.campaign_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Payments</p>
              <p className="text-sm text-gray-600">Payment confirmations and updates</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('payment_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.payment_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.payment_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-600">New messages and replies</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('message_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.message_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.message_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-gray-100">
          <div className="flex items-center">
            <SettingsIcon className="w-5 h-5 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-900">System</p>
              <p className="text-sm text-gray-600">Important system updates and announcements</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle('system_notifications')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.system_notifications ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.system_notifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            saved
              ? 'bg-green-600 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          } disabled:opacity-50`}
        >
          {loading ? 'Saving...' : saved ? 'Saved!' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}