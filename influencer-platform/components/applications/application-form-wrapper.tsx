'use client'

import { useRouter } from 'next/navigation'
import { ApplicationFormEnhanced } from './application-form-enhanced'
import { Campaign } from '@/lib/types/campaign'

interface ApplicationFormWrapperProps {
  campaign: Campaign
  campaignId: string
  userId: string
}

export function ApplicationFormWrapper({ campaign, campaignId, userId }: ApplicationFormWrapperProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/influencer/campaigns/${campaignId}`)
    router.refresh()
  }

  const handleCancel = () => {
    router.push(`/influencer/campaigns/${campaignId}`)
  }

  return (
    <ApplicationFormEnhanced 
      campaign={campaign}
      userId={userId}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}