'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, InfluencerProfile, BrandProfile, UserRole } from '@/lib/types/database'
import { updateUserProfile } from '@/lib/actions/user-actions'
import { Upload, X, Plus } from 'lucide-react'

interface ProfileEditFormProps {
  user: User
  profile: InfluencerProfile | BrandProfile | null
  onCancel?: () => void
  onSuccess?: () => void
}

export function ProfileEditForm({ user, profile, onCancel, onSuccess }: ProfileEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar_url || null)
  
  const isInfluencer = user.role === 'influencer'
  const influencerProfile = isInfluencer ? profile as InfluencerProfile : null
  const brandProfile = !isInfluencer ? profile as BrandProfile : null

  // Form state
  const [formData, setFormData] = useState({
    fullName: user.full_name,
    bio: profile?.bio || '',
    // Influencer specific
    username: influencerProfile?.username || '',
    instagramHandle: influencerProfile?.instagram_handle || '',
    tiktokHandle: influencerProfile?.tiktok_handle || '',
    followerCount: influencerProfile?.follower_count || 0,
    categories: influencerProfile?.categories || [],
    // Brand specific
    companyName: brandProfile?.company_name || '',
    industry: brandProfile?.industry || '',
    website: brandProfile?.website || '',
    location: brandProfile?.location || '',
    description: brandProfile?.description || ''
  })

  const [newCategory, setNewCategory] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }))
      setNewCategory('')
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateUserProfile({
        userId: user.id,
        fullName: formData.fullName,
        bio: formData.bio,
        avatarFile,
        profileData: isInfluencer ? {
          username: formData.username,
          instagram_handle: formData.instagramHandle,
          tiktok_handle: formData.tiktokHandle,
          follower_count: formData.followerCount,
          categories: formData.categories
        } : {
          company_name: formData.companyName,
          industry: formData.industry,
          website: formData.website,
          location: formData.location,
          description: formData.description
        }
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        onSuccess?.()
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const availableIndustries = [
    'Technology', 'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 'Gaming', 
    'Education', 'Finance', 'Healthcare', 'Entertainment', 'Sports', 'Other'
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="avatar" className="btn btn-secondary cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Change Avatar
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <p className="text-sm text-gray-500 mt-1">JPG, PNG up to 5MB</p>
          </div>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="w-full"
            />
          </div>

          {isInfluencer && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="@username"
                className="w-full"
              />
            </div>
          )}

          {!isInfluencer && (
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Bio / Description */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            {isInfluencer ? 'Bio' : 'Description'}
          </label>
          <textarea
            id="bio"
            name="bio"
            value={isInfluencer ? formData.bio : formData.description}
            onChange={(e) => {
              if (isInfluencer) {
                handleInputChange(e)
              } else {
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
            }}
            rows={4}
            className="w-full"
            placeholder={isInfluencer ? 'Tell us about yourself...' : 'Describe your company...'}
          />
        </div>

        {/* Influencer-specific fields */}
        {isInfluencer && (
          <>
            {/* Social Media Handles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="instagramHandle" className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  id="instagramHandle"
                  name="instagramHandle"
                  value={formData.instagramHandle}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="tiktokHandle" className="block text-sm font-medium text-gray-700 mb-2">
                  TikTok Handle
                </label>
                <input
                  type="text"
                  id="tiktokHandle"
                  name="tiktokHandle"
                  value={formData.tiktokHandle}
                  onChange={handleInputChange}
                  placeholder="@username"
                  className="w-full"
                />
              </div>
            </div>

            {/* Follower Count */}
            <div>
              <label htmlFor="followerCount" className="block text-sm font-medium text-gray-700 mb-2">
                Total Follower Count
              </label>
              <input
                type="number"
                id="followerCount"
                name="followerCount"
                value={formData.followerCount}
                onChange={handleInputChange}
                min="0"
                className="w-full"
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Categories
              </label>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add a category"
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                />
                <Button type="button" onClick={addCategory} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Brand-specific fields */}
        {!isInfluencer && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full"
                >
                  <option value="">Select an industry</option>
                  {availableIndustries.map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="City, Country"
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full"
              />
            </div>
          </>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}