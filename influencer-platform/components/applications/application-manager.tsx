'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { ApplicationCardEnhanced } from './application-card-enhanced'
import { updateApplicationWithLinks } from '@/lib/actions/application-actions-enhanced'

interface ApplicationManagerProps {
  applications: any[]
  userRole: 'brand' | 'influencer'
}

export function ApplicationManager({ applications, userRole }: ApplicationManagerProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleStatusChange = async (applicationId: string, status: string) => {
    console.log('[ApplicationManager] handleStatusChange called:', applicationId, status)
    // Handle deletion separately - just refresh the page
    if (status === 'deleted') {
      console.log('[ApplicationManager] Handling deletion - refreshing page')
      router.refresh()
      return
    }
    
    setIsUpdating(applicationId)
    
    try {
      const result = await updateApplicationWithLinks(applicationId, { status: status as any })
      
      if (result.success) {
        toast.success(
          status === 'approved' ? 'Application approved!' :
          status === 'rejected' ? 'Application rejected' :
          'Application updated'
        )
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update application')
      }
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {applications.map((application) => (
        <ApplicationCardEnhanced
          key={application.id}
          application={application}
          userRole={userRole}
          onStatusChange={handleStatusChange}
          showActions={isUpdating !== application.id}
        />
      ))}
    </div>
  )
}