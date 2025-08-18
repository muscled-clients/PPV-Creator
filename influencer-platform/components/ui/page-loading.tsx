'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function PageLoadingIndicator() {
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Show loading when route changes
    setLoading(true)
    
    // Hide loading after page has loaded
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300) // Adjust based on your typical load times

    return () => clearTimeout(timer)
  }, [pathname])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-pulse">
        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-[loading_2s_ease-in-out_infinite]"></div>
      </div>
      
      <style jsx>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}

interface DataLoadingOverlayProps {
  loading: boolean
  message?: string
}

export function DataLoadingOverlay({ loading, message = "Loading..." }: DataLoadingOverlayProps) {
  if (!loading) return null

  return (
    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <div className="flex flex-col items-center gap-3 p-6">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}