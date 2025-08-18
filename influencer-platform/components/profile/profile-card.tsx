'use client'

import { User, InfluencerProfile, BrandProfile } from '@/lib/types/database'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User as UserIcon, 
  Mail, 
  Globe, 
  Instagram, 
  Music,
  Building2,
  MapPin,
  Calendar,
  Edit3
} from 'lucide-react'

interface ProfileCardProps {
  user: User
  profile: InfluencerProfile | BrandProfile | null
  isOwnProfile?: boolean
  onEdit?: () => void
}

export function ProfileCard({ user, profile, isOwnProfile = false, onEdit }: ProfileCardProps) {
  const [imageError, setImageError] = useState(false)

  const isInfluencer = user.role === 'influencer'
  const influencerProfile = isInfluencer ? profile as InfluencerProfile : null
  const brandProfile = !isInfluencer ? profile as BrandProfile : null

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile?.avatar_url && !imageError ? (
              <img
                src={profile.avatar_url}
                alt={user.full_name}
                className="w-16 h-16 rounded-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-gray-900">{user.full_name}</h2>
            <Badge variant={user.role === 'influencer' ? 'default' : 'secondary'}>
              {user.role}
            </Badge>
          </div>
        </div>
        
        {isOwnProfile && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="flex items-center space-x-1"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </Button>
        )}
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Mail className="w-4 h-4" />
          <span className="text-sm break-all">{user.email}</span>
        </div>
        
        {profile?.bio && (
          <p className="text-gray-700 text-sm leading-relaxed break-words">{profile.bio}</p>
        )}
      </div>

      {/* Role-specific Information */}
      {isInfluencer && influencerProfile && (
        <div className="space-y-3">
          {/* Username */}
          {influencerProfile.username && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 break-all">@{influencerProfile.username}</span>
            </div>
          )}

          {/* Social Media */}
          <div className="space-y-2">
            {influencerProfile.instagram_handle && (
              <div className="flex items-center space-x-2">
                <Instagram className="w-4 h-4 text-pink-500" />
                <a 
                  href={`https://instagram.com/${influencerProfile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {influencerProfile.instagram_handle}
                </a>
              </div>
            )}
            
            {influencerProfile.tiktok_handle && (
              <div className="flex items-center space-x-2">
                <Music className="w-4 h-4 text-black" />
                <a 
                  href={`https://tiktok.com/${influencerProfile.tiktok_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {influencerProfile.tiktok_handle}
                </a>
              </div>
            )}
          </div>

          {/* Follower Count */}
          {influencerProfile.follower_count && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatFollowerCount(influencerProfile.follower_count)}
                </div>
                <div className="text-sm text-gray-500">Total Followers</div>
              </div>
            </div>
          )}

          {/* Categories */}
          {influencerProfile.categories && influencerProfile.categories.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {influencerProfile.categories.map((category, index) => (
                  <Badge key={index} variant="outline" className="text-xs break-words">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Reputation Score */}
          {influencerProfile.reputation_score !== null && (
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {influencerProfile.reputation_score}/100
                </div>
                <div className="text-sm text-green-700">Reputation Score</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Brand Profile Information */}
      {!isInfluencer && brandProfile && (
        <div className="space-y-3">
          {/* Company Name */}
          {brandProfile.company_name && (
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{brandProfile.company_name}</span>
            </div>
          )}

          {/* Industry */}
          {brandProfile.industry && (
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{brandProfile.industry}</Badge>
            </div>
          )}

          {/* Website */}
          {brandProfile.website && (
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <a 
                href={brandProfile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline break-all"
              >
                {brandProfile.website.replace('https://', '').replace('http://', '')}
              </a>
            </div>
          )}

          {/* Location */}
          {brandProfile.location && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 break-words">{brandProfile.location}</span>
            </div>
          )}

          {/* Description */}
          {brandProfile.description && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-700 leading-relaxed break-words">
                {brandProfile.description}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Member Since */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-gray-500">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Member since {formatDate(user.created_at)}</span>
        </div>
      </div>
    </div>
  )
}