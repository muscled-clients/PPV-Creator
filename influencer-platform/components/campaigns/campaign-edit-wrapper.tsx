'use client'

import { useRouter } from 'next/navigation'
import { CampaignForm } from './campaign-form'

interface CampaignEditWrapperProps {
  initialData: any
  campaignId: string
}

export function CampaignEditWrapper({ initialData, campaignId }: CampaignEditWrapperProps) {
  const router = useRouter()

  const handleSuccess = () => {
    router.push(`/brand/campaigns/${campaignId}`)
  }

  return (
    <CampaignForm 
      mode="edit" 
      initialData={initialData}
      onSuccess={handleSuccess}
    />
  )
}