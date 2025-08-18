'use client'

import { useRouter } from 'next/navigation'
import { ApplicationForm } from './application-form'
import { Campaign } from '@/lib/types/campaign'

interface ApplicationFormWrapperProps {
  campaign: Campaign
  campaignId: string
}

export function ApplicationFormWrapper({ campaign, campaignId }: ApplicationFormWrapperProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/influencer/campaigns/${campaignId}`)
    router.refresh()
  }

  const handleCancel = () => {
    router.push(`/influencer/campaigns/${campaignId}`)
  }

  return (
    <ApplicationForm 
      campaign={campaign}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  )
}