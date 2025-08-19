'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Target, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Users,
  DollarSign,
  Calendar,
  Building2,
  Sparkles
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Campaign {
  id: string
  title: string
  description: string
  brand_id: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget: number
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
  brand_name?: string
  applications_count?: number
  approved_applications?: number
}

export default function CampaignReviewPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ [key: string]: { x: number; y: number; position: 'above' | 'below' } }>({})
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})
  
  const supabase = createClient()

  useEffect(() => {
    fetchCampaigns()
  }, [filterStatus])

  // Close dropdown on scroll or resize
  useEffect(() => {
    const handleScrollOrResize = () => {
      if (actionMenuOpen) {
        setActionMenuOpen(null)
      }
    }

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [actionMenuOpen])

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('campaigns')
        .select(`
          *,
          brand_profiles!campaigns_brand_id_fkey (
            company_name
          )
        `)
        .order('created_at', { ascending: false })

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus)
      }

      const { data, error } = await query

      if (error) throw error
      
      // Transform data to include brand name
      const campaignsWithBrandNames = data?.map((campaign: any) => ({
        ...campaign,
        brand_name: campaign.brand_profiles?.company_name || 'Unknown Brand'
      })) || []
      
      setCampaigns(campaignsWithBrandNames)
    } catch (error) {
      console.error('Error fetching campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId)

      if (error) throw error

      toast.success(`Campaign status updated to ${newStatus}`)
      fetchCampaigns()
    } catch (error) {
      console.error('Error updating campaign status:', error)
      toast.error('Failed to update campaign status')
    }
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId)

      if (error) throw error

      toast.success('Campaign deleted successfully')
      fetchCampaigns()
    } catch (error) {
      console.error('Error deleting campaign:', error)
      toast.error('Failed to delete campaign')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Edit className="w-3 h-3 mr-1" />
            Draft
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Paused
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleActionMenuClick = (campaignId: string, event: React.MouseEvent<HTMLButtonElement>, index: number, totalCampaigns: number) => {
    event.preventDefault()
    event.stopPropagation()
    
    const button = event.currentTarget
    const rect = button.getBoundingClientRect()
    const menuWidth = 192 // w-48 = 12rem = 192px
    
    // Same menu height as user management page that works well
    const menuHeight = 152 // Matching user management page
    
    // Positioning logic
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    
    // Only open above if there's not enough space below AND enough space above
    const shouldOpenAbove = spaceBelow < menuHeight && spaceAbove >= menuHeight
    
    // Calculate X position (right-aligned with button)
    const x = rect.right - menuWidth
    
    // Calculate Y position - directly touching the button (same as users page)
    let y
    if (shouldOpenAbove) {
      // Open above: dropdown bottom edge almost touches button top
      y = rect.top - menuHeight - 1
      // But don't let it go off the top of the screen
      if (y < 8) {
        // If it would go off-screen, just position it below instead
        y = rect.bottom + 1
      }
    } else {
      // Open below: dropdown top edge almost touches button bottom
      y = rect.bottom + 1
    }
    
    // Ensure dropdown stays within horizontal viewport
    const finalX = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8))
    const finalY = y // Don't clamp Y anymore since we handle it above
    
    console.log('CAMPAIGN DEBUG - Button rect:', rect)
    console.log('CAMPAIGN DEBUG - Should open above:', shouldOpenAbove)
    console.log('CAMPAIGN DEBUG - Raw x,y:', x, y)
    console.log('CAMPAIGN DEBUG - Final x,y:', finalX, finalY)
    
    setDropdownPosition({ 
      ...dropdownPosition, 
      [campaignId]: { x: finalX, y: finalY, position: shouldOpenAbove ? 'above' : 'below' } 
    })
    setActionMenuOpen(actionMenuOpen === campaignId ? null : campaignId)
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.brand_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Review</h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and manage all campaigns on the platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{campaigns.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Active</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Draft</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {campaigns.filter(c => c.status === 'draft').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {campaigns.filter(c => c.status === 'completed').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns by title, description, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 animate-pulse">
              <Target className="w-6 h-6 text-gray-400" />
            </div>
            <p className="mt-2 text-sm text-gray-500">Loading campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No campaigns found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCampaigns.map((campaign, index) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {campaign.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="text-sm text-gray-900">{campaign.brand_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(campaign.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBudget(campaign.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block">
                        <button
                          onClick={(e) => handleActionMenuClick(campaign.id, e, index, filteredCampaigns.length)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {actionMenuOpen === campaign.id && dropdownPosition[campaign.id] && (
                          <div 
                            className="fixed z-50 w-48 rounded-md shadow-xl bg-white ring-1 ring-black ring-opacity-5"
                            style={{
                              left: `${dropdownPosition[campaign.id].x}px`,
                              top: `${dropdownPosition[campaign.id].y}px`
                            }}>
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  router.push(`/admin/campaigns/${campaign.id}`)
                                  setActionMenuOpen(null)
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </button>
                              
                              {campaign.status === 'active' ? (
                                <button
                                  onClick={() => {
                                    handleStatusChange(campaign.id, 'paused')
                                    setActionMenuOpen(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full text-left"
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" />
                                  Pause Campaign
                                </button>
                              ) : campaign.status === 'paused' ? (
                                <button
                                  onClick={() => {
                                    handleStatusChange(campaign.id, 'active')
                                    setActionMenuOpen(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Activate Campaign
                                </button>
                              ) : null}
                              
                              {campaign.status === 'draft' && (
                                <button
                                  onClick={() => {
                                    handleStatusChange(campaign.id, 'cancelled')
                                    setActionMenuOpen(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancel Campaign
                                </button>
                              )}
                              
                              <button
                                onClick={() => {
                                  handleDeleteCampaign(campaign.id)
                                  setActionMenuOpen(null)
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Campaign
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Click outside handler */}
      {actionMenuOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  )
}