'use client'

import Link from 'next/link'
import { Application } from '@/lib/types/database'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  User,
  Calendar,
  DollarSign,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Instagram,
  Music,
  Star,
  ExternalLink
} from 'lucide-react'

interface ApplicationCardProps {
  application: Application & {
    campaigns?: {
      title: string
      budget_amount: number
      brand_id: string
    }
    users?: {
      full_name: string
    }
    influencer_profiles?: {
      username?: string
      follower_count?: number
      reputation_score?: number
      avatar_url?: string
      instagram_handle?: string
      tiktok_handle?: string
    }
  }
  userRole: 'influencer' | 'brand' | 'admin'
  onStatusChange?: (applicationId: string, status: string) => void
  showActions?: boolean
}

export function ApplicationCard({ 
  application, 
  userRole, 
  onStatusChange,
  showActions = true 
}: ApplicationCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatFollowerCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'withdrawn':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'withdrawn':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          {userRole === 'brand' ? (
            // Brand view - show influencer info
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                {application.influencer_profiles?.avatar_url ? (
                  <img
                    src={application.influencer_profiles.avatar_url}
                    alt={application.users?.full_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-primary-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {application.users?.full_name || 'Influencer'}
                </h3>
                {application.influencer_profiles?.username && (
                  <p className="text-sm text-gray-600">@{application.influencer_profiles.username}</p>
                )}
              </div>
            </div>
          ) : (
            // Influencer view - show campaign info
            <div className="mb-2">
              <h3 className="font-semibold text-gray-900">
                {application.campaigns?.title || 'Campaign'}
              </h3>
              <p className="text-sm text-gray-600">
                Budget: ${application.campaigns?.budget_amount.toLocaleString() || 0}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {getStatusIcon(application.status)}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
            {application.status}
          </span>
        </div>
      </div>

      {/* Influencer Stats (for brand view) */}
      {userRole === 'brand' && application.influencer_profiles && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="font-semibold text-gray-900">
              {application.influencer_profiles.follower_count 
                ? formatFollowerCount(application.influencer_profiles.follower_count)
                : 'N/A'
              }
            </div>
            <div className="text-xs text-gray-500">Followers</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 flex items-center justify-center">
              {application.influencer_profiles.reputation_score || 0}
              <Star className="w-3 h-3 text-yellow-500 ml-1" />
            </div>
            <div className="text-xs text-gray-500">Reputation</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center space-x-1">
              {application.influencer_profiles.instagram_handle && (
                <Instagram className="w-4 h-4 text-pink-500" />
              )}
              {application.influencer_profiles.tiktok_handle && (
                <Music className="w-4 h-4 text-black" />
              )}
            </div>
            <div className="text-xs text-gray-500">Platforms</div>
          </div>
        </div>
      )}

      {/* Application Message */}
      <div className="mb-4">
        <div className="flex items-center mb-2">
          <MessageSquare className="w-4 h-4 text-gray-500 mr-1" />
          <span className="text-sm font-medium text-gray-700">Application Message</span>
        </div>
        <p className="text-sm text-gray-600 line-clamp-3">
          {application.message}
        </p>
      </div>

      {/* Proposed Rate & Deliverables */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
        {application.proposed_rate && (
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-gray-700">
              Proposed Rate: <span className="font-medium">${application.proposed_rate.toLocaleString()}</span>
            </span>
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-gray-700">
            Applied: {formatDate(application.created_at)}
          </span>
        </div>
      </div>

      {application.deliverables && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-1">Proposed Deliverables</h4>
          <p className="text-sm text-blue-800 line-clamp-2">{application.deliverables}</p>
        </div>
      )}

      {/* Campaign Content - Show for brand view */}
      {userRole === 'brand' && (application.instagram_content_url || application.tiktok_content_url) && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg">
          <h4 className="text-sm font-medium text-purple-900 mb-2">Submitted Campaign Content</h4>
          <div className="space-y-2">
            {application.instagram_content_url && (
              <a
                href={application.instagram_content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-pink-600 hover:text-pink-700"
              >
                <Instagram className="w-4 h-4 mr-1" />
                Review Instagram Content
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
            {application.tiktok_content_url && (
              <a
                href={application.tiktok_content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-black hover:text-gray-800"
              >
                <Music className="w-4 h-4 mr-1" />
                Review TikTok Content
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <Link
            href={`/${userRole}/applications/${application.id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Link>

          <div className="flex space-x-2">
            {userRole === 'brand' && application.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusChange?.(application.id, 'rejected')}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => onStatusChange?.(application.id, 'approved')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </>
            )}

            {userRole === 'influencer' && application.status === 'pending' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onStatusChange?.(application.id, 'withdrawn')}
                className="text-gray-600 border-gray-600 hover:bg-gray-50"
              >
                Withdraw
              </Button>
            )}

            {application.status === 'approved' && (
              <Link
                href={`/${userRole === 'brand' ? 'brand' : 'influencer'}/campaigns/${application.campaign_id}`}
                className="inline-flex items-center text-sm bg-primary-600 text-white px-3 py-1 rounded-md hover:bg-primary-700"
              >
                View Campaign
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}