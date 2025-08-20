'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProfileCard } from '@/components/profile/profile-card'
import { ProfileEditForm } from '@/components/profile/profile-edit-form'
import { User, InfluencerProfile } from '@/lib/types/database'
import { ArrowLeft } from 'lucide-react'

interface ProfilePageClientProps {
  user: User
  profile: InfluencerProfile | null
}

export function ProfilePageClient({ user, profile }: ProfilePageClientProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)

  const handleEditSuccess = () => {
    setEditing(false)
    router.refresh() // Refresh the page to get updated data
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                {editing ? 'Edit Profile' : 'My Profile'}
              </h1>
              <p className="text-gray-600 mt-2">
                {editing 
                  ? 'Update your profile information' 
                  : 'Manage your influencer profile and settings'
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
              {/* Profile Card */}
              <div className="xl:col-span-1">
                <ProfileCard
                  user={user}
                  profile={profile}
                  isOwnProfile={true}
                  onEdit={() => setEditing(true)}
                />
              </div>

              {/* Profile Details */}
              <div className="xl:col-span-2 space-y-6">
                {/* Bio Section */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                  {user?.bio ? (
                    <p className="text-gray-700 leading-relaxed break-words">{user.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">No bio added yet. Click edit to add one!</p>
                  )}
                </div>

                {/* Social Media Stats */}
                {(profile?.instagram_handle || profile?.tiktok_handle) && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {profile.instagram_handle && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">Instagram</h3>
                          <p className="text-primary-600 break-all">{profile.instagram_handle}</p>
                          <a
                            href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View Profile →
                          </a>
                        </div>
                      )}
                      
                      {profile.tiktok_handle && (
                        <div className="border border-gray-200 rounded-lg p-4">
                          <h3 className="font-medium text-gray-900 mb-2">TikTok</h3>
                          <p className="text-primary-600 break-all">{profile.tiktok_handle}</p>
                          <a
                            href={`https://tiktok.com/${profile.tiktok_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                          >
                            View Profile →
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {profile?.niche && profile.niche.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Categories</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.niche.map((category: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 break-words max-w-full"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {profile ? (
                          (profile.instagram_followers + profile.tiktok_followers) >= 1000000
                            ? `${((profile.instagram_followers + profile.tiktok_followers) / 1000000).toFixed(1)}M`
                            : (profile.instagram_followers + profile.tiktok_followers) >= 1000
                            ? `${((profile.instagram_followers + profile.tiktok_followers) / 1000).toFixed(1)}K`
                            : (profile.instagram_followers + profile.tiktok_followers).toString()
                        ) : '0'}
                      </div>
                      <div className="text-sm text-gray-500">Total Followers</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {profile?.reputation_score || 0}
                      </div>
                      <div className="text-sm text-gray-500">Reputation Score</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">0</div>
                      <div className="text-sm text-gray-500">Completed Campaigns</div>
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
                      onClick={() => router.push('/influencer/campaigns')}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Browse Campaigns
                    </button>
                    <button
                      onClick={() => router.push('/influencer/settings')}
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