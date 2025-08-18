'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { trackViews } from '@/lib/actions/view-tracking-actions'
import { toast } from 'react-hot-toast'
import { Instagram, Music, TrendingUp, RefreshCw } from 'lucide-react'

interface ViewTrackerProps {
  campaignId: string
  influencerId: string
  currentViews?: {
    instagram_views: number
    tiktok_views: number
    total_views: number
  }
  onUpdate?: () => void
}

export function ViewTracker({ 
  campaignId, 
  influencerId, 
  currentViews = { instagram_views: 0, tiktok_views: 0, total_views: 0 },
  onUpdate 
}: ViewTrackerProps) {
  const [loading, setLoading] = useState(false)
  const [viewData, setViewData] = useState({
    instagram_views: currentViews.instagram_views,
    tiktok_views: currentViews.tiktok_views
  })

  const handleUpdateViews = async () => {
    setLoading(true)
    try {
      const result = await trackViews({
        campaign_id: campaignId,
        influencer_id: influencerId,
        instagram_views: viewData.instagram_views,
        tiktok_views: viewData.tiktok_views
      })

      if (result.success) {
        toast.success('Views updated successfully!')
        onUpdate?.()
      } else {
        toast.error(result.error || 'Failed to update views')
      }
    } catch (error) {
      console.error('Error updating views:', error)
      toast.error('An error occurred while updating views')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center space-x-2 mb-3">
        <TrendingUp className="w-4 h-4 text-purple-600" />
        <h3 className="font-medium text-gray-900">Update View Count</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Instagram Views */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Instagram className="w-4 h-4 inline mr-1 text-pink-500" />
            Instagram Views
          </label>
          <input
            type="number"
            value={viewData.instagram_views}
            onChange={(e) => setViewData(prev => ({
              ...prev,
              instagram_views: parseInt(e.target.value) || 0
            }))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0"
          />
        </div>

        {/* TikTok Views */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Music className="w-4 h-4 inline mr-1 text-black" />
            TikTok Views
          </label>
          <input
            type="number"
            value={viewData.tiktok_views}
            onChange={(e) => setViewData(prev => ({
              ...prev,
              tiktok_views: parseInt(e.target.value) || 0
            }))}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Total Views:</span>
          <span className="font-bold text-purple-900">
            {(viewData.instagram_views + viewData.tiktok_views).toLocaleString()}
          </span>
        </div>
      </div>

      <Button 
        onClick={handleUpdateViews}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Updating...
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4 mr-2" />
            Update Views
          </>
        )}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Enter the current view counts from your posts. This will update your earnings calculation.
      </p>
    </div>
  )
}