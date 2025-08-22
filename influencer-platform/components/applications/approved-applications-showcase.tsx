'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Trophy,
  Star,
  Eye,
  ExternalLink,
  Instagram,
  Video,
  TrendingUp,
  Users,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Link
} from 'lucide-react'

interface ContentLink {
  id: string
  platform: 'instagram' | 'tiktok'
  content_url: string
  views_tracked: number
  is_selected: boolean
}

interface ApprovedApplication {
  id: string
  message: string
  created_at: string
  influencer?: {
    id: string
    full_name: string
    username?: string
    avatar_url?: string
  }
  content_links?: ContentLink[]
}

interface ApprovedApplicationsShowcaseProps {
  applications: ApprovedApplication[]
  campaignTitle: string
}

export function ApprovedApplicationsShowcase({ 
  applications, 
  campaignTitle 
}: ApprovedApplicationsShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!applications || applications.length === 0) {
    return null
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? applications.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === applications.length - 1 ? 0 : prev + 1))
  }

  const currentApp = applications[currentIndex]
  const contentLinks = currentApp.content_links || []
  // Only show selected/approved links in the showcase
  const selectedLinks = contentLinks.filter(link => link.is_selected === true)
  const totalViews = selectedLinks.reduce((sum, link) => sum + link.views_tracked, 0)


  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views.toString()
  }

  const getPlatformIcon = (platform: string) => {
    return platform === 'instagram' ? Instagram : Video
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Get Inspired!</h2>
            <p className="text-sm text-gray-600">
              See successful applications from approved influencers
            </p>
          </div>
        </div>
        
        {applications.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevious}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Previous application"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm text-gray-600 px-2">
              {currentIndex + 1} / {applications.length}
            </span>
            <button
              onClick={handleNext}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              aria-label="Next application"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Approved Application Card */}
      <div className="bg-white rounded-lg border border-purple-100 p-5">
        {/* Influencer Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {currentApp.influencer?.avatar_url ? (
              <Image
                src={currentApp.influencer.avatar_url}
                alt={currentApp.influencer.full_name || 'Influencer'}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {currentApp.influencer?.full_name || 'Anonymous Influencer'}
              </h3>
              {currentApp.influencer?.username && (
                <p className="text-sm text-gray-500">@{currentApp.influencer.username}</p>
              )}
            </div>
          </div>
          
          {/* Success Badge */}
          <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium">Approved</span>
          </div>
        </div>

        {/* Application Message */}
        {currentApp.message && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Application Message</span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              {currentApp.message}
            </p>
          </div>
        )}

        {/* Content Performance - More Prominent */}
        {selectedLinks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Link className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-bold text-gray-800">Approved Content</span>
              </div>
              {totalViews > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">{formatViews(totalViews)} total views</span>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              {selectedLinks.map((link) => {
                const PlatformIcon = getPlatformIcon(link.platform)
                return (
                  <a
                    key={link.id}
                    href={link.content_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-400">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          <PlatformIcon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900 capitalize flex items-center gap-2">
                            View {link.platform} Post
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                              ✓ Approved
                            </span>
                            <ExternalLink className="w-4 h-4 text-green-500 group-hover:text-green-700" />
                          </p>
                          {link.views_tracked > 0 && (
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm text-gray-600 flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {formatViews(link.views_tracked)} views
                              </span>
                              <span className="text-sm text-green-600 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                High engagement
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="group-hover:text-opacity-80 bg-white p-2 rounded-lg shadow-sm text-green-600">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
            
            {/* Call to action */}
            <div className="mt-3 p-3 bg-purple-100 rounded-lg border border-purple-200">
              <p className="text-xs text-purple-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Click the posts above to see how successful influencers created content for this campaign
              </p>
            </div>
          </div>
        )}

        {/* If no selected content links but application is approved */}
        {selectedLinks.length === 0 && (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Approved content will be displayed here once posted
            </p>
          </div>
        )}

        {/* Performance Metrics */}
        {totalViews > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-lg font-bold">{formatViews(totalViews)}</span>
                </div>
                <p className="text-xs text-gray-500">Total Views</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-lg font-bold">{selectedLinks.length}</span>
                </div>
                <p className="text-xs text-gray-500">Content Pieces</p>
              </div>
              
              {selectedLinks.length > 0 && (
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                    <Eye className="w-4 h-4" />
                    <span className="text-lg font-bold">
                      {formatViews(Math.round(totalViews / selectedLinks.length))}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Avg. Views</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Inspiration Footer */}
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          💡 Craft a compelling application message that showcases your unique value!
        </p>
      </div>
    </div>
  )
}