'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { publishCampaign, pauseCampaign, completeCampaign } from '@/lib/actions/campaign-actions'
import Link from 'next/link'
import { Edit, Play, Pause, CheckCircle, X } from 'lucide-react'

interface CampaignDetailActionsProps {
  campaign: any
}

export function CampaignDetailActions({ campaign }: CampaignDetailActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handlePublish = async () => {
    setIsLoading(true)
    try {
      const result = await publishCampaign(campaign.id)
      if (result.success) {
        toast.success('Campaign published successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to publish campaign')
      }
    } catch (error) {
      console.error('Error publishing campaign:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePause = async () => {
    setIsLoading(true)
    try {
      const result = await pauseCampaign(campaign.id)
      if (result.success) {
        toast.success('Campaign paused successfully!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to pause campaign')
      }
    } catch (error) {
      console.error('Error pausing campaign:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    if (!confirm('Are you sure you want to mark this campaign as completed?')) {
      return
    }
    
    setIsLoading(true)
    try {
      const result = await completeCampaign(campaign.id)
      if (result.success) {
        toast.success('Campaign marked as completed!')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to complete campaign')
      }
    } catch (error) {
      console.error('Error completing campaign:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex space-x-3">
      {campaign.status === 'draft' && (
        <>
          <Link
            href={`/brand/campaigns/${campaign.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={handlePublish}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 mr-2" />
            {isLoading ? 'Publishing...' : 'Publish'}
          </button>
        </>
      )}
      
      {campaign.status === 'active' && (
        <>
          <button
            onClick={handlePause}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <Pause className="w-4 h-4 mr-2" />
            {isLoading ? 'Pausing...' : 'Pause'}
          </button>
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {isLoading ? 'Completing...' : 'Mark Complete'}
          </button>
        </>
      )}
      
      {campaign.status === 'paused' && (
        <button
          onClick={handlePublish}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <Play className="w-4 h-4 mr-2" />
          {isLoading ? 'Resuming...' : 'Resume'}
        </button>
      )}
    </div>
  )
}