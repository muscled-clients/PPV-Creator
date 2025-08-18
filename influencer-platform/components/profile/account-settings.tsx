'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { User } from '@/lib/types/database'
import { 
  updatePassword, 
  updateEmailAddress, 
  deleteUserAccount 
} from '@/lib/actions/user-actions'
import { 
  Shield, 
  Mail, 
  Key, 
  Trash2, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Bell
} from 'lucide-react'
import { NotificationSettings } from '@/components/notifications/notification-settings'

interface AccountSettingsProps {
  user: User
}

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'security' | 'email' | 'notifications' | 'danger'>('security')
  const [loading, setLoading] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  })

  // Account deletion state
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [showDeleteForm, setShowDeleteForm] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setLoading(true)

    try {
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (result.success) {
        toast.success('Password updated successfully!')
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(result.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (emailData.newEmail === user.email) {
      toast.error('New email is the same as current email')
      return
    }

    setLoading(true)

    try {
      const result = await updateEmailAddress({
        newEmail: emailData.newEmail,
        password: emailData.password
      })

      if (result.success) {
        toast.success('Email change request sent! Check your new email for confirmation.')
        setEmailData({ newEmail: '', password: '' })
      } else {
        toast.error(result.error || 'Failed to update email')
      }
    } catch (error) {
      console.error('Email update error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountDeletion = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion')
      return
    }

    setLoading(true)

    try {
      const result = await deleteUserAccount()

      if (result.success) {
        toast.success('Account deleted successfully')
        router.push('/')
      } else {
        toast.error(result.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const tabs = [
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ] as const

  return (
    <div className="bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Update your password to keep your account secure.
              </p>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.current ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    minLength={8}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    minLength={8}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Key className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </div>
        )}

        {/* Email Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Change Email Address</h3>
              <p className="text-sm text-gray-600 mb-2">
                Current email: <strong>{user.email}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                You will receive a confirmation email at your new address.
              </p>
            </div>

            <form onSubmit={handleEmailChange} className="space-y-4 max-w-md">
              <div>
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  New Email Address
                </label>
                <input
                  type="email"
                  id="newEmail"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="emailPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="emailPassword"
                  value={emailData.password}
                  onChange={(e) => setEmailData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                {loading ? 'Updating...' : 'Update Email'}
              </Button>
            </form>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Preferences</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manage how and when you receive notifications.
              </p>
            </div>
            <NotificationSettings userId={user.id} />
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="space-y-6">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <h3 className="text-lg font-medium text-red-900 mb-2 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Danger Zone
              </h3>
              <p className="text-sm text-red-700 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>

              {!showDeleteForm ? (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteForm(true)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              ) : (
                <form onSubmit={handleAccountDeletion} className="space-y-4 max-w-md">
                  <div>
                    <label htmlFor="deleteConfirmation" className="block text-sm font-medium text-red-700 mb-2">
                      Type <strong>DELETE</strong> to confirm
                    </label>
                    <input
                      type="text"
                      id="deleteConfirmation"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      required
                      className="w-full border-red-300 focus:border-red-500 focus:ring-red-500"
                      placeholder="DELETE"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDeleteForm(false)
                        setDeleteConfirmation('')
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="destructive"
                      disabled={loading || deleteConfirmation !== 'DELETE'}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {loading ? 'Deleting...' : 'Delete Account'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}