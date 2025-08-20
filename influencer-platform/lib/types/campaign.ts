export interface Campaign {
  id: string
  brand_id: string
  title: string
  description: string
  requirements: string
  budget_amount: number
  payment_model?: 'cpm' | 'fixed' | 'performance'
  cpm_rate?: number
  max_views?: number
  total_budget_calculated?: number
  price_per_post: number
  slots_available: number
  slots_filled: number
  submission_deadline: string
  start_date: string
  end_date: string
  platforms: string[]
  categories: string[]
  target_audience?: string
  deliverables?: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  brand_profiles?: {
    company_name: string
    avatar_url?: string
    verified?: boolean
  }
  campaign_applications?: Array<{
    id: string
    status: string
    influencer_id: string
  }>
  campaign_view_tracking?: Array<{
    views_tracked: number
    payout_calculated: number
    payout_status: string
    instagram_views: number
    tiktok_views: number
    last_checked_at?: string
  }>
}