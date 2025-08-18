'use client'

import Link from 'next/link'
import { Campaign } from '@/lib/types/campaign'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { 
  CalendarDays,
  DollarSign,
  MapPin,
  Users,
  Eye,
  Edit,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Building2,
  Instagram,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react'

interface CampaignCardProps {
  campaign: Campaign & {
    brand_profiles?: {
      company_name: string
      avatar_url?: string
    }
    campaign_applications?: Array<{ id: string; status: string }>
    campaign_view_tracking?: Array<{
      views_tracked: number
      payout_calculated: number
      payout_status: string
      instagram_views: number
      tiktok_views: number
    }>
  }
  userRole: 'influencer' | 'brand' | 'admin'
  onStatusChange?: (campaignId: string, status: string) => void
  showActions?: boolean
}

export function CampaignCard({ 
  campaign, 
  userRole, 
  onStatusChange,
  showActions = true 
}: CampaignCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatBudget = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpired = new Date(campaign.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const applicationCount = campaign.campaign_applications?.length || 0
  const approvedCount = campaign.campaign_applications?.filter(app => app.status === 'approved').length || 0

  // Calculate view tracking metrics
  const viewTracking = campaign.campaign_view_tracking || []
  const totalViews = viewTracking.reduce((sum, track) => sum + (track.views_tracked || 0), 0)
  const totalInstagramViews = viewTracking.reduce((sum, track) => sum + (track.instagram_views || 0), 0)
  const totalTikTokViews = viewTracking.reduce((sum, track) => sum + (track.tiktok_views || 0), 0)
  const totalPayoutCalculated = viewTracking.reduce((sum, track) => sum + (track.payout_calculated || 0), 0)
  const maxViews = campaign.max_views || 0
  const viewsProgress = maxViews > 0 ? (totalViews / maxViews) * 100 : 0
  
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {campaign.title}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                {campaign.status}
              </span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                CPM
              </Badge>
            </div>
            
            {campaign.brand_profiles && (
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Building2 className="w-4 h-4 mr-1" />
                <span>{campaign.brand_profiles.company_name}</span>
              </div>
            )}
          </div>

          <div className="text-right min-w-[120px]">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 border">
              <div className="text-lg font-bold text-green-600 mb-1">
                1K/${campaign.cpm_rate || 0}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Max Views:</span>
                  <span className="font-medium">{formatViews(maxViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Budget:</span>
                  <span className="font-medium text-green-600">
                    {formatBudget(campaign.total_budget_calculated || campaign.budget_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {campaign.description}
        </p>

        {/* Platforms */}
        {campaign.platforms && campaign.platforms.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-sm text-gray-600">Platforms:</span>
            {campaign.platforms.map((platform, index) => (
              <div key={index} className="flex items-center space-x-1">
                {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                {platform === 'tiktok' && <TikTokIcon className="w-4 h-4 text-black" />}
                <span className="text-sm text-gray-700 capitalize">{platform}</span>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        {campaign.categories && campaign.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {campaign.categories.slice(0, 3).map((category, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {category}
              </Badge>
            ))}
            {campaign.categories.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{campaign.categories.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Real-time Views Tracking */}
        {campaign.status === 'active' && totalViews > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 mb-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Live Performance</span>
              </div>
              <Badge variant="outline" className="text-xs bg-white text-purple-700">
                {viewsProgress.toFixed(1)}% of max
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-purple-700">Total Views:</span>
                  <span className="font-bold text-purple-900">{formatViews(totalViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-700">Est. Payout:</span>
                  <span className="font-bold text-green-600">${totalPayoutCalculated.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                {totalInstagramViews > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Instagram className="w-3 h-3 text-pink-500" />
                      <span className="text-purple-700">IG:</span>
                    </div>
                    <span className="font-medium text-purple-900">{formatViews(totalInstagramViews)}</span>
                  </div>
                )}
                {totalTikTokViews > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <TikTokIcon className="w-3 h-3 text-black" />
                      <span className="text-purple-700">TT:</span>
                    </div>
                    <span className="font-medium text-purple-900">{formatViews(totalTikTokViews)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-purple-700">Views Progress</span>
                <span className="text-xs text-purple-700">{formatViews(totalViews)} / {formatViews(maxViews)}</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(viewsProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Meta Information */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>
              {isExpired ? 'Ended' : `${daysLeft} days left`}
            </span>
          </div>
          
          {userRole === 'brand' && (
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              <span>{applicationCount} applications</span>
            </div>
          )}
          
          {userRole === 'influencer' && campaign.status === 'active' && (
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span>{approvedCount} selected</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="text-xs text-gray-500 mb-4">
          {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {/* View Campaign */}
              <Link
                href={`/${userRole}/campaigns/${campaign.id}`}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Link>
            </div>

            <div className="flex space-x-2">
              {userRole === 'brand' && (
                <>
                  {campaign.status === 'draft' && (
                    <>
                      <Link
                        href={`/brand/campaigns/${campaign.id}/edit`}
                        className="inline-flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      <Button
                        size="sm"
                        onClick={() => onStatusChange?.(campaign.id, 'active')}
                        className="inline-flex items-center"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                    </>
                  )}

                  {campaign.status === 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStatusChange?.(campaign.id, 'paused')}
                      className="inline-flex items-center"
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </Button>
                  )}

                  {campaign.status === 'paused' && (
                    <Button
                      size="sm"
                      onClick={() => onStatusChange?.(campaign.id, 'active')}
                      className="inline-flex items-center"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </Button>
                  )}
                </>
              )}

              {userRole === 'influencer' && campaign.status === 'active' && !isExpired && (
                <Link
                  href={`/influencer/campaigns/${campaign.id}?apply=true`}
                  className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Expiry Warning */}
        {isExpired && campaign.status === 'active' && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            <XCircle className="w-4 h-4 inline mr-1" />
            This campaign has ended
          </div>
        )}
      </div>
    </div>
  )
}