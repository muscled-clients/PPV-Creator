import { DashboardLayoutOptimized } from '@/components/layout/dashboard-layout-optimized'

export default function BrandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutOptimized>{children}</DashboardLayoutOptimized>
}