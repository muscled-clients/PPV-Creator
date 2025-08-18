'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Search,
  Filter,
  X,
  ChevronDown,
  DollarSign,
  Tag,
  Smartphone
} from 'lucide-react'

interface CampaignFiltersProps {
  onFiltersChange: (filters: {
    search?: string
    category?: string
    platform?: string
    min_budget?: number
    max_budget?: number
    status?: string
  }) => void
  userRole: 'influencer' | 'brand' | 'admin'
  initialFilters?: any
}

export function CampaignFilters({ 
  onFiltersChange, 
  userRole,
  initialFilters = {} 
}: CampaignFiltersProps) {
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    category: initialFilters.category || '',
    platform: initialFilters.platform || '',
    min_budget: initialFilters.min_budget || '',
    max_budget: initialFilters.max_budget || '',
    status: initialFilters.status || ''
  })

  const [showAdvanced, setShowAdvanced] = useState(false)

  const categories = [
    'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 
    'Technology', 'Gaming', 'Lifestyle', 'Health', 'Education'
  ]

  const platforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' }
  ]

  const budgetRanges = [
    { label: 'Under $500', min: 0, max: 500 },
    { label: '$500 - $1,000', min: 500, max: 1000 },
    { label: '$1,000 - $5,000', min: 1000, max: 5000 },
    { label: '$5,000 - $10,000', min: 5000, max: 10000 },
    { label: '$10,000+', min: 10000, max: null }
  ]

  const statusOptions = userRole === 'brand' 
    ? [
        { value: 'draft', label: 'Draft' },
        { value: 'active', label: 'Active' },
        { value: 'paused', label: 'Paused' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    : [
        { value: 'active', label: 'Active' }
      ]

  const handleFilterChange = (key: string, value: string | number) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    
    // Clean up empty values
    const cleanFilters = Object.entries(newFilters).reduce((acc, [k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        acc[k as keyof typeof acc] = v
      }
      return acc
    }, {} as any)
    
    onFiltersChange(cleanFilters)
  }

  const handleBudgetRangeSelect = (range: typeof budgetRanges[0]) => {
    setFilters(prev => ({
      ...prev,
      min_budget: range.min,
      max_budget: range.max || ''
    }))
    
    onFiltersChange({
      ...filters,
      min_budget: range.min,
      max_budget: range.max || undefined
    })
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      platform: '',
      min_budget: '',
      max_budget: '',
      status: ''
    })
    onFiltersChange({})
  }

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
          
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center space-x-1 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              <span>Clear</span>
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('category', '')}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filters.category === '' 
                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange('category', category.toLowerCase())}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.category === category.toLowerCase()
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Smartphone className="w-4 h-4 inline mr-1" />
              Platform
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('platform', '')}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filters.platform === '' 
                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Platforms
              </button>
              {platforms.map((platform) => (
                <button
                  key={platform.value}
                  onClick={() => handleFilterChange('platform', platform.value)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.platform === platform.value
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          {/* Budget Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Budget Range
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, min_budget: '', max_budget: '' }))
                  onFiltersChange({ ...filters, min_budget: undefined, max_budget: undefined })
                }}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  filters.min_budget === '' && filters.max_budget === ''
                    ? 'bg-primary-100 border-primary-300 text-primary-800'
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Any Budget
              </button>
              {budgetRanges.map((range, index) => (
                <button
                  key={index}
                  onClick={() => handleBudgetRangeSelect(range)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.min_budget === range.min && 
                    (filters.max_budget === range.max || (range.max === null && filters.max_budget === ''))
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {/* Custom Budget Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input
                  type="number"
                  placeholder="Min budget"
                  value={filters.min_budget}
                  onChange={(e) => handleFilterChange('min_budget', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="number"
                  placeholder="Max budget"
                  value={filters.max_budget}
                  onChange={(e) => handleFilterChange('max_budget', parseInt(e.target.value) || '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Status Filter (for brands) */}
          {userRole === 'brand' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFilterChange('status', '')}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    filters.status === '' 
                      ? 'bg-primary-100 border-primary-300 text-primary-800'
                      : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Status
                </button>
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleFilterChange('status', status.value)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      filters.status === status.value
                        ? 'bg-primary-100 border-primary-300 text-primary-800'
                        : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}