'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createApplication } from '@/lib/actions/application-actions'
import { validateSocialMediaLink } from '@/lib/utils/link-validation'
import { Campaign } from '@/lib/types/campaign'
import { 
  MessageSquare,
  DollarSign,
  FileText,
  Send,
  ArrowLeft,
  Link,
  Instagram,
  Music,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface ApplicationFormProps {
  campaign: Campaign & {
    brand_profiles?: {
      company_name: string
      avatar_url?: string
    }
  }
  onSuccess?: () => void
  onCancel?: () => void
}

export function ApplicationForm({ campaign, onSuccess, onCancel }: ApplicationFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string | null }>({})
  const [formData, setFormData] = useState({
    message: '',
    proposed_rate: '',
    deliverables: '',
    instagram_content_url: '',
    tiktok_content_url: ''
  })

  // Determine which platforms are required for this campaign
  const requiresInstagram = campaign.platforms?.includes('instagram') || false
  const requiresTikTok = campaign.platforms?.includes('tiktok') || false
  const requiresBoth = requiresInstagram && requiresTikTok

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear validation error when user types
    if (name === 'instagram_content_url' || name === 'tiktok_content_url') {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }))
    }
  }

  const validateContentUrl = (url: string, platform: 'instagram' | 'tiktok'): boolean => {
    if (!url) return true // Empty is okay if not required
    
    const validation = validateSocialMediaLink(url)
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [`${platform}_content_url`]: validation.error || 'Invalid URL'
      }))
      return false
    }

    if (validation.platform !== platform) {
      setValidationErrors(prev => ({
        ...prev,
        [`${platform}_content_url`]: `This must be a ${platform} link`
      }))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.message.trim()) {
      toast.error('Application message is required')
      return
    }

    if (formData.message.trim().length < 10) {
      toast.error('Application message must be at least 10 characters long')
      return
    }

    // Validate required content URLs based on campaign platforms
    if (requiresInstagram && !formData.instagram_content_url) {
      toast.error('Please provide an Instagram post URL for this campaign')
      return
    }

    if (requiresTikTok && !formData.tiktok_content_url) {
      toast.error('Please provide a TikTok video URL for this campaign')
      return
    }

    // Validate URL formats
    if (formData.instagram_content_url && !validateContentUrl(formData.instagram_content_url, 'instagram')) {
      return
    }

    if (formData.tiktok_content_url && !validateContentUrl(formData.tiktok_content_url, 'tiktok')) {
      return
    }

    setLoading(true)

    try {
      const result = await createApplication({
        campaign_id: campaign.id,
        message: formData.message.trim(),
        proposed_rate: formData.proposed_rate ? parseFloat(formData.proposed_rate) : undefined,
        deliverables: formData.deliverables.trim() || undefined,
        instagram_content_url: formData.instagram_content_url || undefined,
        tiktok_content_url: formData.tiktok_content_url || undefined
      })

      if (result.success) {
        toast.success('Application submitted successfully!')
        onSuccess?.()
        router.push('/influencer/campaigns')
      } else {
        toast.error(result.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Application submission error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatBudget = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Button */}
      <button
        onClick={onCancel || (() => router.back())}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Campaign
      </button>

      {/* Campaign Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Applying to: {campaign.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium">Brand:</span> {campaign.brand_profiles?.company_name || 'Brand'}
          </div>
          <div>
            <span className="font-medium">Budget:</span> {formatBudget(campaign.budget_amount)}
          </div>
          <div>
            <span className="font-medium">End Date:</span> {new Date(campaign.end_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Platforms:</span> {campaign.platforms?.join(', ') || 'Not specified'}
          </div>
        </div>
      </div>

      {/* Application Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Submit Your Application
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Application Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Why are you perfect for this campaign? *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              placeholder="Tell the brand why you're the perfect fit for this campaign. Mention your relevant experience, audience demographics, previous brand collaborations, and creative ideas for their campaign..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters. Current: {formData.message.length}
            </p>
          </div>

          {/* Content URLs Section - Show based on campaign requirements */}
          {(requiresInstagram || requiresTikTok) && (
            <div className="space-y-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900 flex items-center">
                <Link className="w-4 h-4 mr-2" />
                Campaign Content Submission {requiresBoth ? '(Required for both platforms)' : `(Required for ${requiresInstagram ? 'Instagram' : 'TikTok'})`}
              </h4>
              
              {/* Instagram Content URL */}
              {requiresInstagram && (
                <div>
                  <label htmlFor="instagram_content_url" className="block text-sm font-medium text-gray-700 mb-2">
                    <Instagram className="w-4 h-4 inline mr-1 text-pink-500" />
                    Your Instagram Post/Reel for this Campaign *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="instagram_content_url"
                      name="instagram_content_url"
                      value={formData.instagram_content_url}
                      onChange={handleInputChange}
                      onBlur={() => validateContentUrl(formData.instagram_content_url, 'instagram')}
                      required={requiresInstagram}
                      placeholder="https://instagram.com/p/... or https://instagram.com/reel/..."
                      className={`w-full pr-10 ${validationErrors.instagram_content_url ? 'border-red-500' : ''}`}
                    />
                    {formData.instagram_content_url && validateSocialMediaLink(formData.instagram_content_url).isValid && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.instagram_content_url && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.instagram_content_url}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the link to the Instagram content you've created for this campaign
                  </p>
                </div>
              )}

              {/* TikTok Content URL */}
              {requiresTikTok && (
                <div>
                  <label htmlFor="tiktok_content_url" className="block text-sm font-medium text-gray-700 mb-2">
                    <Music className="w-4 h-4 inline mr-1" />
                    Your TikTok Video for this Campaign *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      id="tiktok_content_url"
                      name="tiktok_content_url"
                      value={formData.tiktok_content_url}
                      onChange={handleInputChange}
                      onBlur={() => validateContentUrl(formData.tiktok_content_url, 'tiktok')}
                      required={requiresTikTok}
                      placeholder="https://tiktok.com/@username/video/..."
                      className={`w-full pr-10 ${validationErrors.tiktok_content_url ? 'border-red-500' : ''}`}
                    />
                    {formData.tiktok_content_url && validateSocialMediaLink(formData.tiktok_content_url).isValid && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.tiktok_content_url && (
                    <p className="text-sm text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors.tiktok_content_url}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Paste the link to the TikTok video you've created for this campaign
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Proposed Rate */}
          <div>
            <label htmlFor="proposed_rate" className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Your Proposed Rate (Optional)
            </label>
            <input
              type="number"
              id="proposed_rate"
              name="proposed_rate"
              value={formData.proposed_rate}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="Enter your rate for this campaign"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              What would you charge for this campaign? Leave blank if you're flexible.
            </p>
          </div>

          {/* Deliverables */}
          <div>
            <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Your Proposed Deliverables (Optional)
            </label>
            <textarea
              id="deliverables"
              name="deliverables"
              value={formData.deliverables}
              onChange={handleInputChange}
              rows={4}
              placeholder="What content will you create? e.g., 1 Instagram post, 3 story posts, 1 TikTok video with custom audio..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what content you'll deliver. Be specific about format, quantity, and timeline.
            </p>
          </div>

          {/* Campaign Requirements Reminder */}
          {campaign.requirements && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">📋 Campaign Requirements</h4>
              <p className="text-sm text-blue-800">{campaign.requirements}</p>
            </div>
          )}

          {/* Expected Deliverables */}
          {campaign.deliverables && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">📦 Expected Deliverables</h4>
              <p className="text-sm text-green-800">{campaign.deliverables}</p>
            </div>
          )}

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
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
        <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Important: Content Submission Process</h4>
        <p className="text-sm text-yellow-800 mb-3">
          You must create and post the campaign content BEFORE submitting your application. The brand will review your actual content to decide whether to approve or reject your application.
        </p>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• First, create and publish your content on Instagram/TikTok</li>
          <li>• Make sure it follows all campaign requirements and guidelines</li>
          <li>• Include all required hashtags and mentions</li>
          <li>• Then submit your application with the content URLs</li>
          <li>• The brand will review your actual posted content</li>
        </ul>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 mt-6">
        <h4 className="font-semibold text-gray-900 mb-2">💡 Application Tips</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Ensure your content meets all campaign requirements before submitting</li>
          <li>• Double-check that all required hashtags and mentions are included</li>
          <li>• Make sure your content is publicly accessible</li>
          <li>• Write a compelling message explaining your creative approach</li>
          <li>• Be professional but let your personality shine through</li>
        </ul>
      </div>
    </div>
  )
}