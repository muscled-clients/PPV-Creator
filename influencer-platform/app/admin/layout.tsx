import { DashboardLayoutOptimized } from '@/components/layout/dashboard-layout-optimized'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <DashboardLayoutOptimized>{children}</DashboardLayoutOptimized>
}