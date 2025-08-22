'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { createApplicationEnhanced } from '@/lib/actions/application-actions-enhanced'
import { Campaign } from '@/lib/types/campaign'
import { validateSocialMediaLink } from '@/lib/utils/validation'
import { 
  Send, 
  Loader2, 
  AlertCircle,
  Instagram,
  Music,
  CheckCircle,
  Link,
  Plus,
  X,
  Globe
} from 'lucide-react'

interface ApplicationFormProps {
  campaign: Campaign
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface ContentLink {
  id: string
  platform: 'instagram' | 'tiktok'
  url: string
}

export function ApplicationFormEnhanced({ 
  campaign, 
  userId, 
  onSuccess, 
  onCancel 
}: ApplicationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    message: ''
  })
  
  // Get required platforms from campaign (normalize to lowercase)
  // If no platforms specified or empty array, default to both
  const campaignPlatforms = campaign.platforms && campaign.platforms.length > 0 
    ? campaign.platforms.map(p => p.toLowerCase())
    : ['instagram', 'tiktok']
  
  // Filter to only valid platforms
  const requiredPlatforms = campaignPlatforms.filter(p => p === 'instagram' || p === 'tiktok')
  
  // If after filtering we have no valid platforms, default to both
  const finalPlatforms = requiredPlatforms.length > 0 ? requiredPlatforms : ['instagram', 'tiktok']
  
  const hasInstagram = finalPlatforms.includes('instagram')
  const hasTikTok = finalPlatforms.includes('tiktok')
  
  // Dynamic content links state - start with first required platform
  const [contentLinks, setContentLinks] = useState<ContentLink[]>([
    { 
      id: '1', 
      platform: hasInstagram ? 'instagram' : 'tiktok', 
      url: '' 
    }
  ])
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleLinkChange = (id: string, field: 'platform' | 'url', value: string) => {
    // If only one platform is required, force that platform
    if (field === 'platform' && finalPlatforms.length === 1) {
      value = finalPlatforms[0]
    }
    
    setContentLinks(prev => prev.map(link => 
      link.id === id ? { ...link, [field]: value } : link
    ))
    // Clear validation error for this link
    if (validationErrors[`link_${id}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`link_${id}`]
        return newErrors
      })
    }
  }

  const addNewLink = () => {
    const newId = (contentLinks.length + 1).toString()
    setContentLinks(prev => [...prev, { 
      id: newId, 
      platform: hasInstagram ? 'instagram' : 'tiktok', 
      url: '' 
    }])
  }

  const removeLink = (id: string) => {
    if (contentLinks.length > 1) {
      setContentLinks(prev => prev.filter(link => link.id !== id))
      // Remove any validation errors for this link
      setValidationErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[`link_${id}`]
        return newErrors
      })
    }
  }

  const validateContentLink = (link: ContentLink): boolean => {
    if (!link.url) {
      setValidationErrors(prev => ({
        ...prev,
        [`link_${link.id}`]: 'URL is required'
      }))
      return false
    }

    const validation = validateSocialMediaLink(link.url)
    if (!validation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        [`link_${link.id}`]: 'Invalid URL format'
      }))
      return false
    }

    // Check if URL matches the selected platform
    const isInstagramUrl = link.url.includes('instagram.com')
    const isTikTokUrl = link.url.includes('tiktok.com')
    
    if (link.platform === 'instagram' && !isInstagramUrl) {
      setValidationErrors(prev => ({
        ...prev,
        [`link_${link.id}`]: 'URL must be an Instagram link'
      }))
      return false
    }
    
    if (link.platform === 'tiktok' && !isTikTokUrl) {
      setValidationErrors(prev => ({
        ...prev,
        [`link_${link.id}`]: 'URL must be a TikTok link'
      }))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setValidationErrors({})
    
    // Validate all content links
    const linksWithContent = contentLinks.filter(link => link.url.trim() !== '')
    if (linksWithContent.length === 0) {
      setValidationErrors({ general: 'At least one content link is required' })
      return
    }

    let hasErrors = false
    for (const link of linksWithContent) {
      if (!validateContentLink(link)) {
        hasErrors = true
      }
    }

    if (hasErrors) {
      toast.error('Please fix the validation errors')
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare the data with multiple links
      const applicationData = {
        campaign_id: campaign.id,
        influencer_id: userId,
        message: formData.message,
        // For backward compatibility, still include the first Instagram and TikTok URLs
        instagram_content_url: contentLinks.find(l => l.platform === 'instagram')?.url,
        tiktok_content_url: contentLinks.find(l => l.platform === 'tiktok')?.url,
        // New field for multiple links
        content_links: linksWithContent.map(link => ({
          platform: link.platform,
          content_url: link.url
        }))
      }

      const result = await createApplicationEnhanced(applicationData)
      
      if (result.success) {
        toast.success('Application submitted successfully!')
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/influencer/applications')
        }
      } else {
        toast.error(result.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting application:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Form Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-purple-50 rounded-t-xl">
        <h3 className="text-lg font-semibold text-gray-900">Create Your Application</h3>
        <p className="text-sm text-gray-600 mt-1">Stand out by showcasing your best content</p>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Message */}
        <div className="group">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2 group-focus-within:text-primary-600 transition-colors">
            Application Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            required
            rows={4}
            placeholder="Explain why you're a great fit for this campaign..."
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 hover:border-gray-300 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">Tell the brand what makes you unique</p>
        </div>

        {/* Multiple Content Links Section */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <Link className="w-4 h-4 text-primary-600" />
                </div>
                Campaign Content Links
              </h4>
              <p className="text-xs text-gray-500 mt-1 ml-11">
                Required platforms: {finalPlatforms.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' & ')}
              </p>
            </div>
            <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
              {contentLinks.filter(l => l.url).length} / {contentLinks.length} added
            </span>
          </div>
        
          <div className="space-y-3">
            {contentLinks.map((link, index) => (
              <div key={link.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-3">
                    {/* Platform Selector - Only show if both platforms are required */}
                    {hasInstagram && hasTikTok ? (
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platform
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleLinkChange(link.id, 'platform', 'instagram')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium ${
                              link.platform === 'instagram'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/25 scale-105'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Instagram className="w-4 h-4" />
                            Instagram
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLinkChange(link.id, 'platform', 'tiktok')}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 font-medium ${
                              link.platform === 'tiktok'
                                ? 'bg-black text-white shadow-lg shadow-black/25 scale-105'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Music className="w-4 h-4" />
                            TikTok
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Single platform - show as label
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Platform
                        </label>
                        <div className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${
                          link.platform === 'instagram'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-pink-500/25'
                            : 'bg-black text-white shadow-lg shadow-black/25'
                        }`}>
                          {link.platform === 'instagram' ? (
                            <>
                              <Instagram className="w-4 h-4" />
                              Instagram
                            </>
                          ) : (
                            <>
                              <Music className="w-4 h-4" />
                              TikTok
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {/* URL Input */}
                    <div className="relative">
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                        placeholder={
                          link.platform === 'instagram'
                            ? 'https://instagram.com/p/... or https://instagram.com/reel/...'
                            : 'https://tiktok.com/@username/video/...'
                        }
                        className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          validationErrors[`link_${link.id}`] 
                            ? 'border-red-500 bg-red-50' 
                            : link.url && validateSocialMediaLink(link.url).isValid
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Globe className="w-4 h-4 text-gray-400" />
                      </div>
                      {link.url && validateSocialMediaLink(link.url).isValid && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center animate-in fade-in duration-200">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )}
                    </div>
                  
                  {/* Validation Error */}
                  {validationErrors[`link_${link.id}`] && (
                    <p className="text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {validationErrors[`link_${link.id}`]}
                    </p>
                  )}
                </div>

                  {/* Remove Button */}
                  {contentLinks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLink(link.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove this link"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>

          {/* Add Link Button */}
          <button
            type="button"
            onClick={addNewLink}
            className="mt-4 w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            <div className="p-1 rounded-full bg-gray-100 group-hover:bg-primary-100 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            Add Another Link
          </button>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Add links to the content you've created for this campaign. You can submit multiple posts.
          </p>
        </div>


        {/* General Error */}
        {validationErrors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top duration-200">
            <p className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {validationErrors.general}
            </p>
          </div>
        )}
      </div>

      {/* Submit Buttons Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
        <div className="flex gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-white hover:shadow-sm transition-all duration-200 font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-3 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}