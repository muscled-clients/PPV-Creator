'use client'

import { Download } from 'lucide-react'

interface ExportButtonProps {
  data: {
    campaigns: any[]
    applications: any[]
    submissions: any[]
    metrics: {
      totalCampaigns: number
      activeCampaigns: number
      completedCampaigns: number
      totalBudget: number
      totalApplications: number
      approvedApplications: number
      conversionRate: number
      totalSubmissions: number
      approvedSubmissions: number
    }
  }
  userName?: string
}

export function ExportButton({ data, userName = 'Brand' }: ExportButtonProps) {
  const handleExport = () => {
    // Generate CSV content
    const csvContent = generateCSV(data, userName)
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `analytics_report_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const generateCSV = (data: ExportButtonProps['data'], userName: string) => {
    const lines = []
    
    // Header
    lines.push(`Analytics Report for ${userName}`)
    lines.push(`Generated on: ${new Date().toLocaleDateString()}`)
    lines.push('')
    
    // Overview Metrics
    lines.push('OVERVIEW METRICS')
    lines.push('Metric,Value')
    lines.push(`Total Campaigns,${data.metrics.totalCampaigns}`)
    lines.push(`Active Campaigns,${data.metrics.activeCampaigns}`)
    lines.push(`Completed Campaigns,${data.metrics.completedCampaigns}`)
    lines.push(`Total Budget,$${data.metrics.totalBudget}`)
    lines.push(`Average Budget per Campaign,$${data.metrics.totalCampaigns > 0 ? Math.round(data.metrics.totalBudget / data.metrics.totalCampaigns) : 0}`)
    lines.push(`Total Applications,${data.metrics.totalApplications}`)
    lines.push(`Approved Applications,${data.metrics.approvedApplications}`)
    lines.push(`Approval Rate,${data.metrics.conversionRate}%`)
    lines.push(`Total Submissions,${data.metrics.totalSubmissions}`)
    lines.push(`Approved Submissions,${data.metrics.approvedSubmissions}`)
    lines.push('')
    
    // Campaigns Details
    lines.push('CAMPAIGNS DETAILS')
    lines.push('Title,Status,Budget,Category,Created Date,Applications,Submissions')
    
    data.campaigns.forEach(campaign => {
      const applicationCount = data.applications.filter(a => a.campaign_id === campaign.id).length
      const submissionCount = data.submissions.filter(s => s.campaign_id === campaign.id).length
      
      lines.push(
        `"${campaign.title}",${campaign.status},$${campaign.budget_amount || 0},"${campaign.category || 'N/A'}",${new Date(campaign.created_at).toLocaleDateString()},${applicationCount},${submissionCount}`
      )
    })
    
    return lines.join('\n')
  }

  return (
    <button 
      onClick={handleExport}
      className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Download className="w-4 h-4 mr-2" />
      Export Report
    </button>
  )
}