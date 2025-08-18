export interface LinkValidationResult {
  isValid: boolean
  platform?: 'instagram' | 'tiktok'
  postId?: string
  error?: string
}

/**
 * Validates social media links and extracts platform and post ID
 */
export function validateSocialMediaLink(url: string): LinkValidationResult {
  if (!url) {
    return { isValid: false, error: 'URL is required' }
  }

  // Ensure URL starts with https://
  if (!url.startsWith('https://')) {
    return { isValid: false, error: 'URL must use HTTPS protocol' }
  }

  try {
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.toLowerCase()
    const pathname = urlObj.pathname

    // Instagram validation
    if (hostname === 'instagram.com' || hostname === 'www.instagram.com') {
      // Check for valid Instagram post types
      const instagramPostRegex = /^\/(p|reel|tv|stories)\/([\w-]+)/
      const match = pathname.match(instagramPostRegex)
      
      if (match) {
        return {
          isValid: true,
          platform: 'instagram',
          postId: match[2]
        }
      }
      
      return { 
        isValid: false, 
        error: 'Invalid Instagram URL. Please provide a direct link to a post, reel, or story.' 
      }
    }

    // TikTok validation
    if (hostname === 'tiktok.com' || hostname === 'www.tiktok.com') {
      // Standard TikTok video URL
      const tiktokVideoRegex = /^\/@[\w.-]+\/video\/(\d+)/
      const match = pathname.match(tiktokVideoRegex)
      
      if (match) {
        return {
          isValid: true,
          platform: 'tiktok',
          postId: match[1]
        }
      }
      
      // Check if it's a general TikTok link that needs to be a video
      if (pathname.includes('/@')) {
        return { 
          isValid: false, 
          error: 'Please provide a direct link to a TikTok video, not a profile page.' 
        }
      }
      
      return { 
        isValid: false, 
        error: 'Invalid TikTok URL. Please provide a direct link to a video.' 
      }
    }

    // Short TikTok URL (vm.tiktok.com)
    if (hostname === 'vm.tiktok.com') {
      // These are valid TikTok short URLs
      const shortIdRegex = /^\/(\w+)/
      const match = pathname.match(shortIdRegex)
      
      if (match) {
        return {
          isValid: true,
          platform: 'tiktok',
          postId: match[1]
        }
      }
    }

    // URL is not from a supported platform
    return { 
      isValid: false, 
      error: 'URL must be from Instagram or TikTok. Other platforms are not supported.' 
    }
  } catch (error) {
    return { 
      isValid: false, 
      error: 'Invalid URL format' 
    }
  }
}

/**
 * Extracts username from social media URL
 */
export function extractUsername(url: string, platform: 'instagram' | 'tiktok'): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname

    if (platform === 'instagram') {
      // Instagram URLs don't always contain username in post links
      // Would need to fetch from API or user profile
      return null
    }

    if (platform === 'tiktok') {
      // Extract username from TikTok URL
      const match = pathname.match(/@([\w.-]+)/)
      return match ? match[1] : null
    }

    return null
  } catch {
    return null
  }
}

/**
 * Generates embed URL for social media posts
 */
export function generateEmbedUrl(url: string, platform: 'instagram' | 'tiktok'): string | null {
  const validation = validateSocialMediaLink(url)
  
  if (!validation.isValid || !validation.postId) {
    return null
  }

  if (platform === 'instagram') {
    // Instagram embed URL format
    return `https://www.instagram.com/p/${validation.postId}/embed`
  }

  if (platform === 'tiktok') {
    // TikTok doesn't have a standard embed URL, would need to use their embed API
    return url
  }

  return null
}

/**
 * Validates if a URL is accessible (not private or deleted)
 * Note: This would need to be implemented with actual API calls in production
 */
export async function checkUrlAccessibility(url: string): Promise<boolean> {
  // In a production environment, this would:
  // 1. Make an API call to Instagram/TikTok API
  // 2. Check if the post exists and is public
  // 3. Return true if accessible, false otherwise
  
  // For now, we'll just validate the URL format
  const validation = validateSocialMediaLink(url)
  return validation.isValid
}

/**
 * Formats social media URL for display
 */
export function formatSocialMediaUrl(url: string): string {
  const validation = validateSocialMediaLink(url)
  
  if (!validation.isValid) {
    return url
  }

  if (validation.platform === 'instagram' && validation.postId) {
    return `Instagram Post (${validation.postId.substring(0, 8)}...)`
  }

  if (validation.platform === 'tiktok' && validation.postId) {
    return `TikTok Video (${validation.postId.substring(0, 8)}...)`
  }

  return url
}

/**
 * Gets platform icon name for UI display
 */
export function getPlatformIcon(platform: 'instagram' | 'tiktok'): string {
  switch (platform) {
    case 'instagram':
      return 'Instagram'
    case 'tiktok':
      return 'Music' // Using Music icon for TikTok in Lucide
    default:
      return 'Link'
  }
}