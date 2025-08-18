'use client'

import Link from 'next/link'
import { Campaign } from '@/lib/types/campaign'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TikTokIcon } from '@/components/icons/tiktok-icon'
import { 
  Calendar,
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
  Clock,
  Sparkles,
  Heart,
  ArrowRight,
  Zap,
  Award,
  Star,
  Globe,
  Timer
} from 'lucide-react'

interface CampaignCardProps {
  campaign: Campaign & {
    brand_profiles?: {
      company_name: string
      avatar_url?: string
      verified?: boolean
    }
    campaign_applications?: Array<{ id: string; status: string; influencer_id: string }>
    campaign_view_tracking?: Array<{
      views_tracked: number
      payout_calculated: number
      payout_status: string
      instagram_views: number
      tiktok_views: number
    }>
  }
  userRole: 'influencer' | 'brand' | 'admin'
  userId?: string
  onStatusChange?: (campaignId: string, status: string) => void
  showActions?: boolean
  featured?: boolean
}

export function CampaignCardEnhanced({ 
  campaign, 
  userRole,
  userId,
  onStatusChange,
  showActions = true,
  featured = false
}: CampaignCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatBudget = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`
    }
    return `$${amount}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200'
      case 'draft':
        return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white'
      case 'paused':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white'
      case 'completed':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500 text-white'
      case 'cancelled':
        return 'bg-gradient-to-r from-red-400 to-rose-500 text-white'
      default:
        return 'bg-gradient-to-r from-gray-400 to-slate-500 text-white'
    }
  }

  const isExpired = new Date(campaign.end_date) < new Date()
  const isNew = (Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 3
  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isUrgent = daysLeft <= 3 && daysLeft > 0

  const applicationCount = campaign.campaign_applications?.length || 0
  const approvedCount = campaign.campaign_applications?.filter(app => app.status === 'approved').length || 0
  const slotsRemaining = (campaign.slots_available || 0) - approvedCount
  
  // Check if current user has already applied
  const userApplication = userId ? campaign.campaign_applications?.find(app => app.influencer_id === userId) : undefined
  const hasApplied = !!userApplication
  const applicationStatus = userApplication?.status

  // Calculate view tracking metrics
  const viewTracking = campaign.campaign_view_tracking || []
  const totalViews = viewTracking.reduce((sum, track) => sum + (track.views_tracked || 0), 0)
  const totalPayoutCalculated = viewTracking.reduce((sum, track) => sum + (track.payout_calculated || 0), 0)
  const maxViews = campaign.max_views || 0
  const viewsProgress = maxViews > 0 ? (totalViews / maxViews) * 100 : 0
  
  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  // Calculate potential earnings
  const potentialEarnings = campaign.cpm_rate ? (maxViews / 1000) * campaign.cpm_rate : 0

  return (
    <div className="relative bg-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-xl shadow-md border border-gray-200">
      {/* New Badge */}
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold">
            NEW
          </div>
        </div>
      )}

      {/* Urgent Badge */}
      {isUrgent && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-red-600 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center space-x-1 animate-pulse">
            <Timer className="w-3 h-3" />
            <span>URGENT</span>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-5">
        {/* Header Section */}
        <div className="mb-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-1">
                {campaign.title}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Building2 className="w-3.5 h-3.5 mr-1" />
                  <span>{campaign.brand_profiles?.company_name || 'Brand'}</span>
                  {campaign.brand_profiles?.verified && (
                    <CheckCircle className="w-3 h-3 ml-1 text-blue-500" />
                  )}
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 
                    campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'}`}>
                  {campaign.status}
                </span>
              </div>
            </div>
            
            {/* CPM Rate */}
            <div className="text-right ml-4">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-lg font-bold text-green-700">{campaign.cpm_rate || 0}</span>
                  <span className="text-xs text-green-600">/1K</span>
                </div>
                <p className="text-xs text-gray-600 mt-0.5">CPM Rate</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm line-clamp-2">
            {campaign.description}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Eye className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatViews(maxViews)}</p>
              <p className="text-xs text-gray-500">Max Views</p>
            </div>
            <div className="text-center border-x border-gray-200">
              <div className="flex items-center justify-center mb-1">
                <Zap className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{formatBudget(potentialEarnings)}</p>
              <p className="text-xs text-gray-500">Potential</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {isExpired ? 'Ended' : daysLeft <= 0 ? 'Today' : `${daysLeft} days`}
              </p>
              <p className="text-xs text-gray-500">Time Left</p>
            </div>
          </div>
        </div>

        {/* Platforms and Categories */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {campaign.platforms && campaign.platforms.map((platform, index) => (
              <div key={index} className="flex items-center">
                {platform === 'instagram' && (
                  <div className="flex items-center space-x-1 bg-pink-100 text-pink-700 px-2 py-0.5 rounded text-xs font-medium">
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </div>
                )}
                {platform === 'tiktok' && (
                  <div className="flex items-center space-x-1 bg-gray-900 text-white px-2 py-0.5 rounded text-xs font-medium">
                    <TikTokIcon className="w-3 h-3" />
                    <span>TikTok</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {campaign.categories && campaign.categories.length > 0 && (
            <div className="flex items-center space-x-1">
              {campaign.categories.slice(0, 2).map((category, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0 px-1.5">
                  {category}
                </Badge>
              ))}
              {campaign.categories.length > 2 && (
                <span className="text-xs text-gray-500">+{campaign.categories.length - 2}</span>
              )}
            </div>
          )}

        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Link
              href={`/${userRole}/campaigns/${campaign.id}`}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center"
            >
              <span>View Details</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>

            {userRole === 'influencer' && (
              <>
                {/* Already Applied - Show Status */}
                {hasApplied && (
                  <div className="flex items-center">
                    {applicationStatus === 'pending' && (
                      <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </div>
                    )}
                    {applicationStatus === 'approved' && (
                      <div className="flex items-center space-x-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        <span>Approved</span>
                      </div>
                    )}
                    {applicationStatus === 'rejected' && (
                      <div className="flex items-center space-x-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        <span>Rejected</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Can Apply - Show Apply Button */}
                {!hasApplied && campaign.status === 'active' && !isExpired && slotsRemaining > 0 && (
                  <Link
                    href={`/influencer/campaigns/${campaign.id}?apply=true`}
                    className="inline-flex items-center bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Link>
                )}

                {/* Cannot Apply - Show Reason */}
                {!hasApplied && (campaign.status !== 'active' || isExpired || slotsRemaining <= 0) && (
                  <span className="text-xs text-gray-500 italic">
                    {isExpired ? 'Ended' : slotsRemaining <= 0 ? 'Full' : 'Not Active'}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}