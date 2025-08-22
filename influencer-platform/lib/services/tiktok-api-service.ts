/**
 * TikTok API Service for fetching real video data
 * 
 * This service integrates with TikTok's APIs to fetch real video metrics
 * including view counts, likes, shares, and comments.
 */

export interface TikTokVideoData {
  id: string
  view_count: number
  like_count: number
  comment_count: number
  share_count: number
  title?: string
  author?: string
  duration?: number
  created_at?: string
}

export interface TikTokApiResponse {
  success: boolean
  data?: TikTokVideoData
  error?: string
  rate_limit_remaining?: number
}

/**
 * TikTok API Service Class
 */
export class TikTokApiService {
  private baseUrl: string
  private clientKey: string
  private clientSecret: string

  constructor() {
    this.baseUrl = process.env.TIKTOK_API_BASE_URL || 'https://open-api.tiktok.com'
    this.clientKey = process.env.TIKTOK_CLIENT_KEY!
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET!

    if (!this.clientKey || !this.clientSecret) {
      throw new Error('TikTok API credentials are not configured')
    }
  }

  /**
   * Extract video ID from TikTok URL
   */
  private extractVideoId(url: string): string | null {
    try {
      const urlObj = new URL(url)
      
      // Standard TikTok URL: https://www.tiktok.com/@username/video/1234567890
      if (urlObj.hostname.includes('tiktok.com')) {
        const match = urlObj.pathname.match(/\/video\/(\d+)/)
        if (match) {
          return match[1]
        }
      }
      
      // Short URL: https://vm.tiktok.com/ABC123/
      if (urlObj.hostname === 'vm.tiktok.com') {
        const shortId = urlObj.pathname.replace('/', '')
        // For short URLs, we need to resolve them first
        return this.resolveShortUrl(url)
      }
      
      return null
    } catch (error) {
      console.error('Error extracting video ID:', error)
      return null
    }
  }

  /**
   * Resolve short TikTok URL to get the actual video ID
   */
  private async resolveShortUrl(shortUrl: string): Promise<string | null> {
    try {
      // Follow the redirect to get the full URL
      const response = await fetch(shortUrl, {
        method: 'HEAD',
        redirect: 'follow'
      })
      
      const finalUrl = response.url
      return this.extractVideoId(finalUrl)
    } catch (error) {
      console.error('Error resolving short URL:', error)
      return null
    }
  }

  /**
   * Get access token using client credentials
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/oauth/access_token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_key: this.clientKey,
          client_secret: this.clientSecret,
          grant_type: 'client_credentials'
        })
      })

      const data = await response.json()
      
      if (data.access_token) {
        return data.access_token
      }
      
      console.error('Failed to get TikTok access token:', data)
      return null
    } catch (error) {
      console.error('Error getting TikTok access token:', error)
      return null
    }
  }

  /**
   * Fetch video data using TikTok Oembed API (Public, no auth required)
   * This is the simplest approach for getting basic video data
   */
  async getVideoDataViaOembed(videoUrl: string): Promise<TikTokApiResponse> {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`
      
      const response = await fetch(oembedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; InfluencerPlatform/1.0)'
        }
      })

      if (!response.ok) {
        return {
          success: false,
          error: `TikTok API returned ${response.status}: ${response.statusText}`
        }
      }

      const data = await response.json()
      
      // Oembed doesn't provide view counts, but gives us basic info
      return {
        success: true,
        data: {
          id: this.extractVideoId(videoUrl) || '',
          view_count: 0, // Not available via oembed
          like_count: 0, // Not available via oembed
          comment_count: 0, // Not available via oembed
          share_count: 0, // Not available via oembed
          title: data.title || '',
          author: data.author_name || '',
          duration: data.duration || 0
        }
      }
    } catch (error) {
      console.error('Error fetching TikTok oembed data:', error)
      return {
        success: false,
        error: 'Failed to fetch video data from TikTok'
      }
    }
  }

  /**
   * Fetch video data using TikTok Research API (Requires special access)
   * This provides more detailed metrics including view counts
   */
  async getVideoDataViaResearchApi(videoId: string): Promise<TikTokApiResponse> {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) {
        return {
          success: false,
          error: 'Failed to get TikTok access token'
        }
      }

      // TikTok Research API endpoint (requires special approval)
      const response = await fetch(`${this.baseUrl}/research/video/query/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: {
            and: [
              {
                operation: 'EQ',
                field_name: 'video_id',
                field_values: [videoId]
              }
            ]
          },
          fields: [
            'id',
            'video_description', 
            'create_time',
            'region_code',
            'share_count',
            'view_count',
            'like_count',
            'comment_count',
            'music_id',
            'effect_ids',
            'hashtag_names',
            'username',
            'duration'
          ]
        })
      })

      const data = await response.json()
      
      if (data.error) {
        return {
          success: false,
          error: data.error.message || 'TikTok API error'
        }
      }

      if (data.data && data.data.videos && data.data.videos.length > 0) {
        const video = data.data.videos[0]
        return {
          success: true,
          data: {
            id: video.id,
            view_count: video.view_count || 0,
            like_count: video.like_count || 0,
            comment_count: video.comment_count || 0,
            share_count: video.share_count || 0,
            title: video.video_description || '',
            author: video.username || '',
            duration: video.duration || 0,
            created_at: video.create_time || ''
          },
          rate_limit_remaining: data.extra?.rate_limit_remaining
        }
      }

      return {
        success: false,
        error: 'Video not found or not accessible'
      }
    } catch (error) {
      console.error('Error fetching TikTok research API data:', error)
      return {
        success: false,
        error: 'Failed to fetch video data from TikTok Research API'
      }
    }
  }

  /**
   * Main method to get video data - tries multiple approaches
   */
  async getVideoData(videoUrl: string): Promise<TikTokApiResponse> {
    const videoId = this.extractVideoId(videoUrl)
    
    if (!videoId) {
      return {
        success: false,
        error: 'Could not extract video ID from URL'
      }
    }

    // Try Research API first (if available)
    if (process.env.TIKTOK_RESEARCH_API_ENABLED === 'true') {
      const researchResult = await this.getVideoDataViaResearchApi(videoId)
      if (researchResult.success) {
        return researchResult
      }
      console.warn('Research API failed, falling back to oembed:', researchResult.error)
    }

    // Fallback to oembed API
    return this.getVideoDataViaOembed(videoUrl)
  }

  /**
   * Batch fetch multiple videos (useful for updating all campaign links)
   */
  async getMultipleVideosData(videoUrls: string[]): Promise<{
    success: boolean
    results: Array<{ url: string; data?: TikTokVideoData; error?: string }>
    rate_limit_remaining?: number
  }> {
    const results = []
    let lastRateLimit: number | undefined

    for (const url of videoUrls) {
      try {
        const result = await this.getVideoData(url)
        results.push({
          url,
          data: result.data,
          error: result.error
        })
        
        if (result.rate_limit_remaining !== undefined) {
          lastRateLimit = result.rate_limit_remaining
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        results.push({
          url,
          error: 'Failed to fetch video data'
        })
      }
    }

    return {
      success: true,
      results,
      rate_limit_remaining: lastRateLimit
    }
  }
}

// Singleton instance
let tiktokApiService: TikTokApiService | null = null

export function getTikTokApiService(): TikTokApiService {
  if (!tiktokApiService) {
    tiktokApiService = new TikTokApiService()
  }
  return tiktokApiService
}