'use client'

import { useEffect } from 'react'

interface DebugApplicationDataProps {
  application: any
}

export function DebugApplicationData({ application }: DebugApplicationDataProps) {
  useEffect(() => {
    console.log('[Debug] Full application data:', application)
    console.log('[Debug] content_links:', application.content_links)
    console.log('[Debug] content_links length:', application.content_links?.length)
    console.log('[Debug] content_links is array:', Array.isArray(application.content_links))
  }, [application])

  return null
}