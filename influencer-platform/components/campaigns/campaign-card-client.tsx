'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { publishCampaign } from '@/lib/actions/campaign-actions'

interface CampaignCardProps {
  campaign: any
}

export function CampaignCardClient({ campaign }: CampaignCardProps) {
  const router = useRouter()
  const [isPublishing, setIsPublishing] = useState(false)
  
  const daysLeft = campaign.end_date ? 
    Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  const handlePublish = async () => {
    setIsPublishing(true)
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
      setIsPublishing(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-semibold text-gray-900 text-lg">{campaign.title}</h3>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          campaign.status === 'active' 
            ? 'bg-green-100 text-green-800'
            : campaign.status === 'draft'
            ? 'bg-yellow-100 text-yellow-800'
            : campaign.status === 'completed'
            ? 'bg-gray-100 text-gray-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {campaign.status}
        </span>
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {campaign.description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Budget</span>
          <span className="font-medium text-gray-900">${campaign.budget_amount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Applications</span>
          <span className="font-medium text-gray-900">{campaign.campaign_applications?.length || 0}</span>
        </div>
        {campaign.status === 'active' && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Days Left</span>
            <span className="font-medium text-gray-900">{daysLeft > 0 ? daysLeft : 'Ended'}</span>
          </div>
        )}
      </div>
      
      <div className="flex space-x-2">
        <Link
          href={`/brand/campaigns/${campaign.id}`}
          className="flex-1 text-center bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          View Details
        </Link>
        {campaign.status === 'draft' && (
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 text-center bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        )}
      </div>
    </div>
  )
}