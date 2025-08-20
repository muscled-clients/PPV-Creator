'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CampaignCardEnhanced } from '@/components/campaigns/campaign-card-enhanced'
import { CampaignFilters } from '@/components/campaigns/campaign-filters'
import { getCampaigns } from '@/lib/actions/campaign-actions'
import { Campaign } from '@/lib/types/campaign'
import { 
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  Target,
  Calendar
} from 'lucide-react'

interface CampaignsPageClientProps {
  userId: string
}

export function CampaignsPageClient({ userId }: CampaignsPageClientProps) {
  const searchParams = useSearchParams()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    platform: searchParams.get('platform') || '',
    min_budget: searchParams.get('min_budget') ? parseInt(searchParams.get('min_budget')!) : undefined,
    max_budget: searchParams.get('max_budget') ? parseInt(searchParams.get('max_budget')!) : undefined
  })

  useEffect(() => {
    loadCampaigns()
  }, [filters])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      const result = await getCampaigns(filters, 'influencer', userId)
      
      if (result.success && result.data) {
        setCampaigns(result.data)
      } else {
        console.error('Failed to load campaigns:', result.error)
        setCampaigns([])
      }
    } catch (error) {
      console.error('Error loading campaigns:', error)
      setCampaigns([])
    } finally {
      setLoading(false)
    }
  }

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString())
      }
    })
    
    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
    window.history.replaceState(null, '', newUrl)
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Campaigns ✨
          </h1>
          <p className="text-gray-600">
            Find exciting brand partnerships and grow your influence
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-xl font-bold text-gray-900">{campaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Now</p>
                <p className="text-xl font-bold text-gray-900">{activeCampaigns.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Avg. CPM Rate</p>
                <p className="text-xl font-bold text-gray-900">
                  ${campaigns.length > 0 
                    ? Math.round(campaigns.reduce((sum, c) => sum + (c.cpm_rate || 0), 0) / campaigns.length)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <CampaignFilters
          onFiltersChange={handleFiltersChange}
          userRole="influencer"
          initialFilters={filters}
        />

        {/* Campaigns */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {Object.keys(filters).some(key => filters[key as keyof typeof filters]) 
                ? 'Filtered Results' 
                : 'Available Campaigns'
              }
            </h2>
            <span className="text-sm text-gray-500">
              {campaigns.length} campaign{campaigns.length !== 1 ? 's' : ''} found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCardEnhanced
                  key={campaign.id}
                  campaign={campaign}
                  userRole="influencer"
                  userId={userId}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No campaigns found
              </h3>
              <p className="text-gray-500 mb-4">
                {Object.keys(filters).some(key => filters[key as keyof typeof filters])
                  ? 'Try adjusting your filters to see more campaigns.'
                  : 'No active campaigns are available at the moment. Check back later!'
                }
              </p>
              {Object.keys(filters).some(key => filters[key as keyof typeof filters]) && (
                <button
                  onClick={() => handleFiltersChange({})}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pro Tips */}
        {!loading && campaigns.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Apply early to increase your chances of being selected</li>
              <li>• Customize your application message for each campaign</li>
              <li>• Highlight relevant experience and engagement rates</li>
              <li>• Check campaign requirements carefully before applying</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}