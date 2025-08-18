'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Settings,
  DollarSign,
  Shield,
  Bell,
  Mail,
  Globe,
  Database,
  Key,
  Users,
  CreditCard,
  AlertCircle,
  Check,
  X,
  Save,
  RefreshCw,
  Percent,
  Clock,
  FileText,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Info,
  Lock,
  Zap,
  Server,
  Activity
} from 'lucide-react'

interface SystemSettings {
  platform: {
    name: string
    url: string
    supportEmail: string
    maintenanceMode: boolean
    registrationEnabled: boolean
    emailVerificationRequired: boolean
  }
  fees: {
    platformFeePercentage: number
    achProcessingFee: number
    paypalProcessingFee: number
    minimumPayout: number
    payoutFrequency: 'daily' | 'weekly' | 'monthly'
  }
  campaigns: {
    requireApproval: boolean
    minimumBudget: number
    maximumBudget: number
    autoExpireDays: number
    maxApplicationsPerCampaign: number
  }
  users: {
    requireInfluencerVerification: boolean
    requireBrandVerification: boolean
    minFollowersRequired: number
    allowedPlatforms: string[]
    sessionTimeout: number
  }
  notifications: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    adminAlertEmail: string
    lowBalanceThreshold: number
  }
  security: {
    twoFactorRequired: boolean
    passwordMinLength: number
    passwordRequireSpecialChar: boolean
    maxLoginAttempts: number
    ipWhitelist: string[]
  }
  integrations: {
    plaidEnabled: boolean
    dwollaEnabled: boolean
    paypalEnabled: boolean
    coinbaseEnabled: boolean
    instagramApiEnabled: boolean
    tiktokApiEnabled: boolean
  }
}

export default function SystemSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('platform')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [settings, setSettings] = useState<SystemSettings>({
    platform: {
      name: 'Influencer Platform',
      url: 'https://platform.com',
      supportEmail: 'support@platform.com',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    fees: {
      platformFeePercentage: 10,
      achProcessingFee: 1.0,
      paypalProcessingFee: 2.9,
      minimumPayout: 50,
      payoutFrequency: 'weekly'
    },
    campaigns: {
      requireApproval: true,
      minimumBudget: 100,
      maximumBudget: 100000,
      autoExpireDays: 30,
      maxApplicationsPerCampaign: 100
    },
    users: {
      requireInfluencerVerification: false,
      requireBrandVerification: true,
      minFollowersRequired: 1000,
      allowedPlatforms: ['instagram', 'tiktok'],
      sessionTimeout: 60
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: false,
      adminAlertEmail: 'admin@platform.com',
      lowBalanceThreshold: 100
    },
    security: {
      twoFactorRequired: false,
      passwordMinLength: 8,
      passwordRequireSpecialChar: true,
      maxLoginAttempts: 5,
      ipWhitelist: []
    },
    integrations: {
      plaidEnabled: true,
      dwollaEnabled: true,
      paypalEnabled: true,
      coinbaseEnabled: false,
      instagramApiEnabled: false,
      tiktokApiEnabled: false
    }
  })

  useEffect(() => {
    checkAuth()
    loadSettings()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      router.push('/auth/login')
    }
  }

  const loadSettings = async () => {
    try {
      // In a real app, load from database
      // const { data } = await supabase
      //   .from('system_settings')
      //   .select('*')
      //   .single()
      
      // For now, using default values
      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setMessage(null)
    
    try {
      // In a real app, save to database
      // await supabase
      //   .from('system_settings')
      //   .upsert(settings)
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (category: keyof SystemSettings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }))
  }

  const tabs = [
    { id: 'platform', label: 'Platform', icon: Globe },
    { id: 'fees', label: 'Fees & Payments', icon: DollarSign },
    { id: 'campaigns', label: 'Campaigns', icon: FileText },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Zap }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                System Settings
              </h1>
              <p className="text-sm text-gray-500 mt-1">Configure platform settings and preferences</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={loadSettings}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
              >
                <RefreshCw className="w-5 h-5 text-gray-600" />
              </button>
              
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm shadow-lg shadow-blue-500/25 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 border border-blue-200'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                {activeTab === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            {/* Platform Settings */}
            {activeTab === 'platform' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Platform Settings
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings.platform.name}
                      onChange={(e) => updateSetting('platform', 'name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Platform URL
                    </label>
                    <input
                      type="url"
                      value={settings.platform.url}
                      onChange={(e) => updateSetting('platform', 'url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.platform.supportEmail}
                      onChange={(e) => updateSetting('platform', 'supportEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Maintenance Mode</p>
                        <p className="text-sm text-gray-500">Temporarily disable platform access</p>
                      </div>
                      <button
                        onClick={() => updateSetting('platform', 'maintenanceMode', !settings.platform.maintenanceMode)}
                        className="relative"
                      >
                        {settings.platform.maintenanceMode ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Registration Enabled</p>
                        <p className="text-sm text-gray-500">Allow new users to sign up</p>
                      </div>
                      <button
                        onClick={() => updateSetting('platform', 'registrationEnabled', !settings.platform.registrationEnabled)}
                        className="relative"
                      >
                        {settings.platform.registrationEnabled ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Verification Required</p>
                        <p className="text-sm text-gray-500">Require email verification for new users</p>
                      </div>
                      <button
                        onClick={() => updateSetting('platform', 'emailVerificationRequired', !settings.platform.emailVerificationRequired)}
                        className="relative"
                      >
                        {settings.platform.emailVerificationRequired ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fees & Payments Settings */}
            {activeTab === 'fees' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Fees & Payment Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Platform Fee (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={settings.fees.platformFeePercentage}
                          onChange={(e) => updateSetting('fees', 'platformFeePercentage', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <Percent className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Commission on all transactions</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Payout ($)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={settings.fees.minimumPayout}
                          onChange={(e) => updateSetting('fees', 'minimumPayout', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ACH Processing Fee (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={settings.fees.achProcessingFee}
                          onChange={(e) => updateSetting('fees', 'achProcessingFee', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <Percent className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PayPal Processing Fee (%)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={settings.fees.paypalProcessingFee}
                          onChange={(e) => updateSetting('fees', 'paypalProcessingFee', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <Percent className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payout Frequency
                    </label>
                    <select
                      value={settings.fees.payoutFrequency}
                      onChange={(e) => updateSetting('fees', 'payoutFrequency', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">Fee Calculation Example</p>
                        <p className="text-sm text-blue-700 mt-1">
                          $100 transaction = ${(100 * settings.fees.platformFeePercentage / 100).toFixed(2)} platform fee + processing fees
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Campaign Settings */}
            {activeTab === 'campaigns' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Campaign Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Admin Approval</p>
                      <p className="text-sm text-gray-500">Review campaigns before they go live</p>
                    </div>
                    <button
                      onClick={() => updateSetting('campaigns', 'requireApproval', !settings.campaigns.requireApproval)}
                      className="relative"
                    >
                      {settings.campaigns.requireApproval ? (
                        <ToggleRight className="w-12 h-6 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-12 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Budget ($)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={settings.campaigns.minimumBudget}
                          onChange={(e) => updateSetting('campaigns', 'minimumBudget', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Budget ($)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={settings.campaigns.maximumBudget}
                          onChange={(e) => updateSetting('campaigns', 'maximumBudget', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <span className="text-gray-500">$</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Auto-Expire After (days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settings.campaigns.autoExpireDays}
                        onChange={(e) => updateSetting('campaigns', 'autoExpireDays', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Applications per Campaign
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={settings.campaigns.maxApplicationsPerCampaign}
                        onChange={(e) => updateSetting('campaigns', 'maxApplicationsPerCampaign', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Settings */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  User Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Require Influencer Verification</p>
                        <p className="text-sm text-gray-500">Influencers must verify their identity</p>
                      </div>
                      <button
                        onClick={() => updateSetting('users', 'requireInfluencerVerification', !settings.users.requireInfluencerVerification)}
                        className="relative"
                      >
                        {settings.users.requireInfluencerVerification ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Require Brand Verification</p>
                        <p className="text-sm text-gray-500">Brands must verify their business</p>
                      </div>
                      <button
                        onClick={() => updateSetting('users', 'requireBrandVerification', !settings.users.requireBrandVerification)}
                        className="relative"
                      >
                        {settings.users.requireBrandVerification ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Followers Required
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={settings.users.minFollowersRequired}
                      onChange={(e) => updateSetting('users', 'minFollowersRequired', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum followers for influencers to join</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={settings.users.sessionTimeout}
                      onChange={(e) => updateSetting('users', 'sessionTimeout', parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Platforms
                    </label>
                    <div className="space-y-2">
                      {['instagram', 'tiktok', 'youtube', 'twitter'].map(platform => (
                        <label key={platform} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                          <input
                            type="checkbox"
                            checked={settings.users.allowedPlatforms.includes(platform)}
                            onChange={(e) => {
                              const platforms = e.target.checked
                                ? [...settings.users.allowedPlatforms, platform]
                                : settings.users.allowedPlatforms.filter(p => p !== platform)
                              updateSetting('users', 'allowedPlatforms', platforms)
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="capitalize font-medium">{platform}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Settings */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-600" />
                  Notification Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-500">Send email notifications to users</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', 'emailNotifications', !settings.notifications.emailNotifications)}
                        className="relative"
                      >
                        {settings.notifications.emailNotifications ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">SMS Notifications</p>
                        <p className="text-sm text-gray-500">Send SMS notifications (requires Twilio)</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', 'smsNotifications', !settings.notifications.smsNotifications)}
                        className="relative"
                      >
                        {settings.notifications.smsNotifications ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-500">Browser push notifications</p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', 'pushNotifications', !settings.notifications.pushNotifications)}
                        className="relative"
                      >
                        {settings.notifications.pushNotifications ? (
                          <ToggleRight className="w-12 h-6 text-blue-600" />
                        ) : (
                          <ToggleLeft className="w-12 h-6 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admin Alert Email
                    </label>
                    <input
                      type="email"
                      value={settings.notifications.adminAlertEmail}
                      onChange={(e) => updateSetting('notifications', 'adminAlertEmail', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Receive important system alerts</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Low Balance Alert Threshold ($)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={settings.notifications.lowBalanceThreshold}
                        onChange={(e) => updateSetting('notifications', 'lowBalanceThreshold', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Alert when brand balance falls below this amount</p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-600" />
                  Security Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                    </div>
                    <button
                      onClick={() => updateSetting('security', 'twoFactorRequired', !settings.security.twoFactorRequired)}
                      className="relative"
                    >
                      {settings.security.twoFactorRequired ? (
                        <ToggleRight className="w-12 h-6 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-12 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Password Length
                      </label>
                      <input
                        type="number"
                        min="6"
                        max="32"
                        value={settings.security.passwordMinLength}
                        onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) => updateSetting('security', 'maxLoginAttempts', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Require Special Characters</p>
                      <p className="text-sm text-gray-500">Passwords must contain special characters</p>
                    </div>
                    <button
                      onClick={() => updateSetting('security', 'passwordRequireSpecialChar', !settings.security.passwordRequireSpecialChar)}
                      className="relative"
                    >
                      {settings.security.passwordRequireSpecialChar ? (
                        <ToggleRight className="w-12 h-6 text-blue-600" />
                      ) : (
                        <ToggleLeft className="w-12 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-900">Security Notice</p>
                        <p className="text-sm text-yellow-700 mt-1">
                          Changes to security settings will affect all users immediately
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Integration Settings */}
            {activeTab === 'integrations' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Integration Settings
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: 'plaidEnabled', label: 'Plaid', desc: 'Bank account verification' },
                      { key: 'dwollaEnabled', label: 'Dwolla', desc: 'ACH transfers' },
                      { key: 'paypalEnabled', label: 'PayPal', desc: 'PayPal payouts' },
                      { key: 'coinbaseEnabled', label: 'Coinbase', desc: 'Crypto payments' },
                      { key: 'instagramApiEnabled', label: 'Instagram API', desc: 'Profile verification' },
                      { key: 'tiktokApiEnabled', label: 'TikTok API', desc: 'Profile verification' }
                    ].map(integration => (
                      <div key={integration.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{integration.label}</p>
                          <p className="text-sm text-gray-500">{integration.desc}</p>
                        </div>
                        <button
                          onClick={() => updateSetting('integrations', integration.key, !settings.integrations[integration.key as keyof typeof settings.integrations])}
                          className="relative"
                        >
                          {settings.integrations[integration.key as keyof typeof settings.integrations] ? (
                            <ToggleRight className="w-12 h-6 text-blue-600" />
                          ) : (
                            <ToggleLeft className="w-12 h-6 text-gray-400" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">API Keys Required</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Enable integrations only after configuring API keys in environment variables
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}