'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Calendar,
  DollarSign,
  User,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  Link,
  Eye,
  TrendingUp
} from 'lucide-react'
import { ApplicationLinksDisplay, ContentLink } from './application-links-display'
import { ApplicationApprovalModal } from './application-approval-modal'
import { updateApplicationWithLinks, withdrawApplication } from '@/lib/actions/application-actions-enhanced'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface ApplicationCardEnhancedProps {
  application: {
    id: string
    campaign_id: string
    influencer_id: string
    message: string
    proposed_rate?: number
    deliverables?: string
    status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
    created_at: string
    updated_at?: string
    campaigns?: {
      id: string
      title: string
      brand_id: string
      payment_model?: string
      cpm_rate?: number
    }
    influencer?: {
      id: string
      full_name: string
      username?: string
      avatar_url?: string
    }
    content_links?: ContentLink[]
  }
  userRole: 'brand' | 'influencer'
  onStatusChange?: (applicationId: string, status: string) => void
  showActions?: boolean
}

export function ApplicationCardEnhanced({
  application,
  userRole,
  onStatusChange,
  showActions = true
}: ApplicationCardEnhancedProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const statusConfig = {
    pending: {
      label: 'Pending Review',
      icon: Clock,
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    },
    approved: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'bg-green-100 text-green-800 border-green-300'
    },
    rejected: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-100 text-red-800 border-red-300'
    },
    withdrawn: {
      label: 'Withdrawn',
      icon: XCircle,
      className: 'bg-gray-100 text-gray-600 border-gray-300'
    }
  }

  const status = statusConfig[application.status]
  const StatusIcon = status.icon

  // Calculate stats for content links
  const contentLinks = application.content_links || []
  const selectedLinksCount = contentLinks.filter(link => link.is_selected).length
  const totalViews = contentLinks
    .filter(link => link.is_selected)
    .reduce((sum, link) => sum + link.views_tracked, 0)

  const handleApprove = async (applicationId: string, selectedLinkIds: string[]) => {
    setIsUpdating(true)
    try {
      const result = await updateApplicationWithLinks(applicationId, {
        status: 'approved',
        selected_link_ids: selectedLinkIds
      })
      
      if (result.success) {
        onStatusChange?.(applicationId, 'approved')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleReject = async (applicationId: string) => {
    setIsUpdating(true)
    try {
      const result = await updateApplicationWithLinks(applicationId, {
        status: 'rejected'
      })
      
      if (result.success) {
        onStatusChange?.(applicationId, 'rejected')
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw this application? This will delete your application and allow you to apply again if needed.')) return
    
    console.log('[UI] Starting withdrawal for application:', application.id)
    setIsUpdating(true)
    try {
      console.log('[UI] Calling withdrawApplication function...')
      const result = await withdrawApplication(application.id)
      console.log('[UI] Withdrawal result:', result)
      
      if (result.success) {
        toast.success(result.message || 'Application withdrawn successfully')
        console.log('[UI] Calling onStatusChange with deleted status')
        // Call onStatusChange with 'deleted' to trigger UI update
        onStatusChange?.(application.id, 'deleted')
      } else {
        console.error('[UI] Failed to withdraw application:', result.error)
        toast.error(result.error || 'Failed to withdraw application')
      }
    } catch (error) {
      console.error('[UI] Error withdrawing application:', error)
      toast.error('An unexpected error occurred while withdrawing the application')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              {userRole === 'brand' && application.influencer && (
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                  {application.influencer.avatar_url ? (
                    <Image
                      src={application.influencer.avatar_url}
                      alt={application.influencer.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
              )}
              
              {/* Title and Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {userRole === 'brand' 
                    ? application.influencer?.full_name || 'Unknown Influencer'
                    : application.campaigns?.title || 'Unknown Campaign'
                  }
                </h3>
                {userRole === 'brand' && application.influencer?.username && (
                  <p className="text-sm text-gray-500">@{application.influencer.username}</p>
                )}
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                  {contentLinks.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Link className="w-3 h-3" />
                      {contentLinks.length} link{contentLinks.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status Badge */}
            <Badge className={`${status.className} border`}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {status.label}
            </Badge>
          </div>
        </div>

        {/* Content Links Summary */}
        {contentLinks.length > 0 && (
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-gray-600">
                  Content Links:
                </span>
                {application.status === 'approved' && selectedLinksCount > 0 ? (
                  <>
                    <span className="font-medium text-green-600">
                      {selectedLinksCount} selected
                    </span>
                    <span className="text-gray-400">|</span>
                    <span className="flex items-center gap-1 text-gray-700">
                      <Eye className="w-4 h-4" />
                      {totalViews.toLocaleString()} total views
                    </span>
                    {application.campaigns?.payment_model === 'cpm' && application.campaigns?.cpm_rate && (
                      <>
                        <span className="text-gray-400">|</span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <TrendingUp className="w-4 h-4" />
                          ${((totalViews / 1000) * application.campaigns.cpm_rate).toFixed(2)} earned
                        </span>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-gray-500">
                    {contentLinks.length} submitted
                  </span>
                )}
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="p-4">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1" />
              Application Message
            </h4>
            <p className="text-sm text-gray-600 line-clamp-3">{application.message}</p>
          </div>

          {/* Proposed Rate */}
          {application.proposed_rate && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Proposed Rate
              </h4>
              <p className="text-sm text-gray-900 font-medium">
                ${application.proposed_rate.toFixed(2)}
              </p>
            </div>
          )}

          {/* Deliverables */}
          {application.deliverables && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Additional Deliverables
              </h4>
              <p className="text-sm text-gray-600">{application.deliverables}</p>
            </div>
          )}
        </div>

        {/* Expanded Content Links */}
        {isExpanded && contentLinks.length > 0 && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Submitted Content Links
              </h4>
              <ApplicationLinksDisplay
                links={contentLinks}
                userRole={userRole}
                showViewCounts={application.status === 'approved'}
                isSelectionMode={false}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            {userRole === 'brand' && application.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowApprovalModal(true)}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Review & Approve
                </button>
                <button
                  onClick={() => handleReject(application.id)}
                  disabled={isUpdating}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject All
                </button>
              </div>
            )}
            
            {userRole === 'influencer' && application.status === 'pending' && (
              <button
                onClick={handleWithdraw}
                disabled={isUpdating}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Withdraw Application
              </button>
            )}
            
            {application.status !== 'pending' && (
              <div className="text-center text-sm text-gray-500">
                {application.status === 'approved' && selectedLinksCount > 0 && (
                  <span className="text-green-600 font-medium">
                    {selectedLinksCount} link{selectedLinksCount !== 1 ? 's' : ''} approved for tracking
                  </span>
                )}
                {application.status === 'rejected' && (
                  <span className="text-red-600">Application rejected</span>
                )}
                {application.status === 'withdrawn' && (
                  <span className="text-gray-600">Application withdrawn</span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <ApplicationApprovalModal
          applicationId={application.id}
          applicantName={application.influencer?.full_name || 'Unknown'}
          contentLinks={contentLinks}
          onClose={() => setShowApprovalModal(false)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </>
  )
}