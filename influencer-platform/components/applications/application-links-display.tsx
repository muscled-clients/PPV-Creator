'use client'

import { Instagram, Music, ExternalLink, Eye, TrendingUp } from 'lucide-react'
import { LinkStatusBadge, LinkStatus } from './link-status-badge'

export interface ContentLink {
  id: string
  platform: 'instagram' | 'tiktok'
  content_url: string
  is_selected: boolean
  selection_status: LinkStatus
  views_tracked: number
  selection_date?: string
}

interface ApplicationLinksDisplayProps {
  links: ContentLink[]
  userRole: 'influencer' | 'brand'
  showViewCounts?: boolean
  onLinkSelect?: (linkId: string, selected: boolean) => void
  isSelectionMode?: boolean
}

export function ApplicationLinksDisplay({
  links,
  userRole,
  showViewCounts = true,
  onLinkSelect,
  isSelectionMode = false
}: ApplicationLinksDisplayProps) {
  const getPlatformIcon = (platform: 'instagram' | 'tiktok') => {
    return platform === 'instagram' ? Instagram : Music
  }

  const getPlatformColor = (platform: 'instagram' | 'tiktok') => {
    return platform === 'instagram' ? 'text-pink-500' : 'text-black'
  }

  const getPlatformBgColor = (platform: 'instagram' | 'tiktok') => {
    return platform === 'instagram' ? 'bg-pink-50' : 'bg-gray-100'
  }

  const totalViews = links
    .filter(link => link.is_selected)
    .reduce((sum, link) => sum + link.views_tracked, 0)

  const selectedCount = links.filter(link => link.is_selected).length

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {userRole === 'influencer' && links.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">Links Selected</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedCount} of {links.length}
                </p>
              </div>
              {selectedCount > 0 && (
                <div className="border-l border-gray-300 pl-4">
                  <p className="text-sm text-gray-600">Total Views Tracked</p>
                  <p className="text-xl font-bold text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-5 h-5" />
                    {totalViews.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {links.map((link) => {
          const Icon = getPlatformIcon(link.platform)
          const color = getPlatformColor(link.platform)
          const bgColor = getPlatformBgColor(link.platform)
          
          return (
            <div
              key={link.id}
              className={`
                border rounded-lg p-4 transition-all
                ${link.is_selected ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'}
                ${isSelectionMode ? 'cursor-pointer hover:shadow-md' : ''}
              `}
              onClick={() => isSelectionMode && onLinkSelect && onLinkSelect(link.id, !link.is_selected)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {/* Platform Icon */}
                    <div className={`p-2 rounded-lg ${bgColor}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    
                    {/* Platform Name */}
                    <span className="font-medium text-gray-900 capitalize">
                      {link.platform}
                    </span>
                    
                    {/* Status Badge */}
                    <LinkStatusBadge 
                      status={link.selection_status}
                      viewCount={link.views_tracked}
                      showViewCount={showViewCounts && link.is_selected}
                      size="sm"
                    />
                  </div>
                  
                  {/* URL */}
                  <div className="flex items-center gap-2">
                    <a
                      href={link.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Content
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-xs text-gray-500 truncate max-w-md">
                      {link.content_url}
                    </span>
                  </div>
                  
                  {/* Additional Info */}
                  {link.selection_date && (
                    <p className="text-xs text-gray-500 mt-1">
                      {link.is_selected ? 'Selected' : 'Reviewed'} on {new Date(link.selection_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {/* Selection Checkbox for Brand */}
                {isSelectionMode && userRole === 'brand' && (
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={link.is_selected}
                      onChange={(e) => {
                        e.stopPropagation()
                        onLinkSelect && onLinkSelect(link.id, e.target.checked)
                      }}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </div>
                )}
                
                {/* View Count for Brand */}
                {userRole === 'brand' && link.is_selected && showViewCounts && (
                  <div className="ml-4 text-right">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {link.views_tracked.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">views</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No content links submitted yet</p>
        </div>
      )}

      {/* Selection Mode Instructions */}
      {isSelectionMode && userRole === 'brand' && links.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            ✓ Select the links you want to approve for view tracking and payment.
            Only selected links will be tracked and paid for.
          </p>
        </div>
      )}
    </div>
  )
}