'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/profile/profile-card'
import { ProfileEditForm } from '@/components/profile/profile-edit-form'
import { getUserProfile } from '@/lib/actions/user-actions'
import { useAuth } from '@/lib/hooks/use-auth'
import { User, BrandProfile } from '@/lib/types/database'
import { ArrowLeft, Building2, Globe, MapPin } from 'lucide-react'

export default function BrandProfilePage() {
  const router = useRouter()
  const { user: authUser, loading: authLoading, role } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<BrandProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (authLoading) {
      return
    }

    // Redirect if not authenticated
    if (!authUser) {
      router.push('/auth/login')
      return
    }

    // Redirect if not a brand
    if (role !== 'brand') {
      router.push('/auth/login')
      return
    }

    // Load profile data
    loadProfile()
  }, [authUser, authLoading, role, router])

  const loadProfile = async () => {
    if (!authUser) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result = await getUserProfile(authUser.id)
      if (result.success && result.data) {
        setUser(result.data.user)
        setProfile(result.data.profile as BrandProfile)
      } else {
        console.error('Failed to load profile:', result.error)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSuccess = () => {
    setEditing(false)
    loadProfile() // Reload the updated profile
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {editing ? 'Edit Profile' : 'Brand Profile'}
              </h1>
              <p className="text-gray-600 mt-2">
                {editing 
                  ? 'Update your brand information' 
                  : 'Manage your brand profile and company details'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {editing ? (
            <ProfileEditForm
              user={user}
              profile={profile}
              onCancel={() => setEditing(false)}
              onSuccess={handleEditSuccess}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1">
                <ProfileCard
                  user={user}
                  profile={profile}
                  isOwnProfile={true}
                  onEdit={() => setEditing(true)}
                />
              </div>

              {/* Profile Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Company Information */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
                  <div className="space-y-4">
                    {profile?.company_name && (
                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Company Name</p>
                          <p className="font-medium text-gray-900">{profile.company_name}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.industry && (
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Industry</p>
                          <p className="font-medium text-gray-900">{profile.industry}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">{profile.location}</p>
                        </div>
                      </div>
                    )}
                    
                    {profile?.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Website</p>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary-600 hover:text-primary-700"
                          >
                            {profile.website.replace('https://', '').replace('http://', '')}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Company Description */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About Company</h2>
                  {profile?.description ? (
                    <p className="text-gray-700 leading-relaxed">{profile.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No company description added yet. Click edit to add one!</p>
                  )}
                </div>

                {/* Campaign Statistics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Statistics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-500">Active Campaigns</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-500">Total Campaigns</div>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">$0</div>
                      <div className="text-sm text-gray-500">Total Spent</div>
                    </div>
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Account Type</span>
                      <span className="font-medium text-primary-600">Brand Account</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Verification Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Verification
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Member Since</span>
                      <span className="font-medium text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => router.push('/brand/campaigns/create')}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Create Campaign
                    </button>
                    <button
                      onClick={() => router.push('/brand/campaigns')}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      View Campaigns
                    </button>
                    <button
                      onClick={() => router.push('/brand/settings')}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Account Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}