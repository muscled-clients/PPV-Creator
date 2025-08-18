'use client'

import { ErrorBoundary } from '@/components/ui/error-boundary'

export function DashboardContent({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  )
}