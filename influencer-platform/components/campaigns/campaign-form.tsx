'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createCampaign, updateCampaign } from '@/lib/actions/campaign-actions'
import { Campaign } from '@/lib/types/database'
import { 
  CalendarDays,
  DollarSign,
  Target,
  Users,
  Plus,
  X,
  Instagram
} from 'lucide-react'
import { TikTokIcon } from '@/components/icons/tiktok-icon'

interface CampaignFormProps {
  initialData?: Partial<Campaign>
  mode: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
}

export function CampaignForm({ 
  initialData, 
  mode = 'create', 
  onSuccess, 
  onCancel 
}: CampaignFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    requirements: initialData?.requirements || '',
    budget_amount: initialData?.budget_amount || 0,
    payment_model: 'cpm', // Always CPM
    cpm_rate: initialData?.cpm_rate || 10,
    max_views: initialData?.max_views || 100000,
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    platforms: initialData?.platforms || [],
    categories: initialData?.categories || [],
    target_audience: initialData?.target_audience || '',
    deliverables: initialData?.deliverables || ''
  })

  // Calculate total budget for CPM model
  const calculateCPMBudget = () => {
    if (formData.cpm_rate && formData.max_views) {
      return (formData.max_views / 1000) * formData.cpm_rate
    }
    return 0
  }

  const [newCategory, setNewCategory] = useState('')

  const availableCategories = [
    'Fashion', 'Beauty', 'Fitness', 'Food', 'Travel', 
    'Technology', 'Gaming', 'Lifestyle', 'Health', 'Education'
  ]

  const availablePlatforms = [
    { value: 'instagram', label: 'Instagram', icon: Instagram },
    { value: 'tiktok', label: 'TikTok', icon: TikTokIcon }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'budget_amount' ? parseFloat(value) || 0 : value
    }))
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category.toLowerCase())
        ? prev.categories.filter(c => c !== category.toLowerCase())
        : [...prev.categories, category.toLowerCase()]
    }))
  }

  const addCustomCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim().toLowerCase()]
      }))
      setNewCategory('')
    }
  }

  const removeCategory = (categoryToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.title.trim()) {
      toast.error('Campaign title is required')
      return
    }

    if (!formData.description.trim()) {
      toast.error('Campaign description is required')
      return
    }

    // Validate CPM fields
    if (!formData.cpm_rate || formData.cpm_rate <= 0) {
      toast.error('CPM rate must be greater than 0')
      return
    }
    if (!formData.max_views || formData.max_views < 1000) {
      toast.error('Maximum views must be at least 1,000')
      return
    }

    if (!formData.start_date || !formData.end_date) {
      toast.error('Start and end dates are required')
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error('End date must be after start date')
      return
    }

    if (formData.platforms.length === 0) {
      toast.error('At least one platform must be selected')
      return
    }

    if (formData.categories.length === 0) {
      toast.error('At least one category must be selected')
      return
    }

    setLoading(true)

    try {
      // Prepare data with calculated budget for CPM
      const campaignData = {
        ...formData,
        budget_amount: calculateCPMBudget(),
        total_budget_calculated: calculateCPMBudget()
      }

      let result
      
      if (mode === 'create') {
        result = await createCampaign(campaignData)
      } else {
        result = await updateCampaign(initialData?.id!, campaignData)
      }

      if (result.success) {
        toast.success(`Campaign ${mode === 'create' ? 'created' : 'updated'} successfully!`)
        onSuccess?.()
        
        if (mode === 'create') {
          router.push('/brand/campaigns')
        }
      } else {
        toast.error(result.error || `Failed to ${mode} campaign`)
      }
    } catch (error) {
      console.error(`Campaign ${mode} error:`, error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {mode === 'create' ? 'Create New Campaign' : 'Edit Campaign'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Campaign Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              placeholder="e.g., Summer Fashion Collection Launch"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* CPM Payment Model Fields */}
          <div className="col-span-3">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">CPM Payment Model</h4>
                <Badge className="bg-purple-100 text-purple-700">Pay per 1,000 views</Badge>
              </div>
              <p className="text-sm text-purple-700">
                You'll pay influencers based on the actual views their content receives, calculated at your specified rate per 1,000 views.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpm_rate" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  CPM Rate *
                </label>
                <input
                  type="number"
                  id="cpm_rate"
                  name="cpm_rate"
                  value={formData.cpm_rate}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Amount you'll pay per 1,000 views</p>
              </div>
              <div>
                <label htmlFor="max_views" className="block text-sm font-medium text-gray-700 mb-2">
                  <Target className="w-4 h-4 inline mr-1" />
                  Maximum Views *
                </label>
                <input
                  type="number"
                  id="max_views"
                  name="max_views"
                  value={formData.max_views}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  step="1000"
                  placeholder="100000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Cap on total views you'll pay for</p>
              </div>
            </div>
            
            {/* Calculated Budget Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">Maximum Campaign Budget</span>
                <span className="text-2xl font-bold text-blue-900">
                  ${calculateCPMBudget().toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                = ({formData.max_views || 0} views ÷ 1,000) × ${formData.cpm_rate || 0} CPM rate
              </p>
              <p className="text-xs text-blue-600 mt-1">
                This is the maximum you'll pay if content reaches the view cap
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="target_audience" className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Target Audience
            </label>
            <input
              type="text"
              id="target_audience"
              name="target_audience"
              value={formData.target_audience}
              onChange={handleInputChange}
              placeholder="e.g., Women 18-35, Fashion enthusiasts"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Describe your campaign objectives, brand story, and what you're looking for in influencer partners..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Requirements */}
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
            Influencer Requirements *
          </label>
          <textarea
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleInputChange}
            required
            rows={3}
            placeholder="e.g., Minimum 10K followers, Fashion/Lifestyle content, High engagement rate..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Deliverables */}
        <div>
          <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-2">
            Expected Deliverables
          </label>
          <textarea
            id="deliverables"
            name="deliverables"
            value={formData.deliverables}
            onChange={handleInputChange}
            rows={3}
            placeholder="e.g., 1 Instagram post, 3 story posts, 1 TikTok video..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDays className="w-4 h-4 inline mr-1" />
              Start Date *
            </label>
            <input
              type="date"
              id="start_date"
              name="start_date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-2">
              End Date *
            </label>
            <input
              type="date"
              id="end_date"
              name="end_date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
              min={formData.start_date || new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Platforms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Target Platforms * (Select at least one)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {availablePlatforms.map((platform) => {
              const Icon = platform.icon
              const isSelected = formData.platforms.includes(platform.value)
              
              return (
                <button
                  key={platform.value}
                  type="button"
                  onClick={() => handlePlatformToggle(platform.value)}
                  className={`p-3 rounded-lg border-2 transition-all flex items-center space-x-2 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{platform.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Content Categories * (Select at least one)
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
            {availableCategories.map((category) => {
              const isSelected = formData.categories.includes(category.toLowerCase())
              
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isSelected
                      ? 'bg-primary-100 text-primary-800 border border-primary-300'
                      : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>

          {/* Selected Categories */}
          {formData.categories.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Selected categories:</p>
              <div className="flex flex-wrap gap-2">
                {formData.categories.map((category, index) => (
                  <Badge key={index} variant="default" className="flex items-center space-x-1">
                    <span className="capitalize">{category}</span>
                    <button
                      type="button"
                      onClick={() => removeCategory(category)}
                      className="ml-1 hover:bg-primary-700 rounded"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Category */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Add custom category"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
            />
            <Button type="button" onClick={addCustomCategory} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => router.back())}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading 
              ? (mode === 'create' ? 'Creating...' : 'Updating...') 
              : (mode === 'create' ? 'Create Campaign' : 'Update Campaign')
            }
          </Button>
        </div>
      </form>
    </div>
  )
}