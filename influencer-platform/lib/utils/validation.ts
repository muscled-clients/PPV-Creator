export function validateSocialMediaLink(url: string): { isValid: boolean; platform?: string } {
  if (!url) {
    return { isValid: false }
  }

  try {
    const urlObj = new URL(url)
    
    // Check for Instagram URLs
    if (urlObj.hostname.includes('instagram.com')) {
      // Valid Instagram post/reel patterns
      const validPaths = ['/p/', '/reel/', '/tv/']
      const hasValidPath = validPaths.some(path => urlObj.pathname.includes(path))
      
      return { 
        isValid: hasValidPath, 
        platform: 'instagram' 
      }
    }
    
    // Check for TikTok URLs
    if (urlObj.hostname.includes('tiktok.com')) {
      // Valid TikTok video pattern
      const hasValidPath = urlObj.pathname.includes('/video/') || 
                          urlObj.pathname.match(/@[\w.]+\/video\/\d+/)
      
      return { 
        isValid: hasValidPath, 
        platform: 'tiktok' 
      }
    }
    
    // URL is valid but not from supported platforms
    return { isValid: false }
    
  } catch (error) {
    // Invalid URL format
    return { isValid: false }
  }
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  // Basic phone validation - can be customized based on requirements
  const phoneRegex = /^[\d\s\-\+\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}