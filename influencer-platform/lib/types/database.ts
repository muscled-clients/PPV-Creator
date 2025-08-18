export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'influencer' | 'brand' | 'admin'
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn'
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'ach' | 'paypal'
export type PlatformType = 'instagram' | 'tiktok'
export type PaymentModel = 'fixed' | 'cpm' | 'performance'
export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected'

// Application type with added content URLs
export type Application = {
  id: string
  campaign_id: string
  influencer_id: string
  message: string
  proposed_rate?: number | null
  deliverables?: string | null
  instagram_content_url?: string | null
  tiktok_content_url?: string | null
  status: ApplicationStatus
  created_at: string
  updated_at?: string | null
}

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          full_name: string | null
          role: UserRole
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          full_name?: string | null
          role?: UserRole
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          full_name?: string | null
          role?: UserRole
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      influencer_profiles: {
        Row: {
          id: string
          user_id: string
          instagram_handle: string | null
          instagram_followers: number
          instagram_engagement: number
          tiktok_handle: string | null
          tiktok_followers: number
          tiktok_engagement: number
          niche: string[] | null
          reputation_score: number
          verified: boolean
          paypal_email: string | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          total_earnings: number
          available_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          instagram_handle?: string | null
          instagram_followers?: number
          instagram_engagement?: number
          tiktok_handle?: string | null
          tiktok_followers?: number
          tiktok_engagement?: number
          niche?: string[] | null
          reputation_score?: number
          verified?: boolean
          paypal_email?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          total_earnings?: number
          available_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          instagram_handle?: string | null
          instagram_followers?: number
          instagram_engagement?: number
          tiktok_handle?: string | null
          tiktok_followers?: number
          tiktok_engagement?: number
          niche?: string[] | null
          reputation_score?: number
          verified?: boolean
          paypal_email?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          total_earnings?: number
          available_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      brand_profiles: {
        Row: {
          id: string
          user_id: string
          company_name: string
          website: string | null
          industry: string | null
          description: string | null
          verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_name: string
          website?: string | null
          industry?: string | null
          description?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_name?: string
          website?: string | null
          industry?: string | null
          description?: string | null
          verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          brand_id: string
          title: string
          description: string | null
          platforms: PlatformType[]
          budget: number
          price_per_post: number
          slots_available: number
          slots_filled: number
          payment_model: PaymentModel
          cpm_rate: number | null
          max_views: number | null
          total_budget_calculated: number | null
          min_instagram_followers: number | null
          min_tiktok_followers: number | null
          min_engagement_rate: number | null
          niche: string[] | null
          hashtags: string[] | null
          mentions: string[] | null
          content_guidelines: string | null
          start_date: string
          end_date: string
          submission_deadline: string
          status: CampaignStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          description?: string | null
          platforms: PlatformType[]
          budget: number
          price_per_post: number
          slots_available: number
          slots_filled?: number
          payment_model?: PaymentModel
          cpm_rate?: number | null
          max_views?: number | null
          total_budget_calculated?: number | null
          min_instagram_followers?: number | null
          min_tiktok_followers?: number | null
          min_engagement_rate?: number | null
          niche?: string[] | null
          hashtags?: string[] | null
          mentions?: string[] | null
          content_guidelines?: string | null
          start_date: string
          end_date: string
          submission_deadline: string
          status?: CampaignStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          description?: string | null
          platforms?: PlatformType[]
          budget?: number
          price_per_post?: number
          slots_available?: number
          slots_filled?: number
          payment_model?: PaymentModel
          cpm_rate?: number | null
          max_views?: number | null
          total_budget_calculated?: number | null
          min_instagram_followers?: number | null
          min_tiktok_followers?: number | null
          min_engagement_rate?: number | null
          niche?: string[] | null
          hashtags?: string[] | null
          mentions?: string[] | null
          content_guidelines?: string | null
          start_date?: string
          end_date?: string
          submission_deadline?: string
          status?: CampaignStatus
          created_at?: string
          updated_at?: string
        }
      }
      campaign_applications: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          proposed_rate: number | null
          cover_letter: string | null
          instagram_content_url: string | null
          tiktok_content_url: string | null
          status: ApplicationStatus
          applied_at: string
          reviewed_at: string | null
          review_notes: string | null
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          proposed_rate?: number | null
          cover_letter?: string | null
          instagram_content_url?: string | null
          tiktok_content_url?: string | null
          status?: ApplicationStatus
          applied_at?: string
          reviewed_at?: string | null
          review_notes?: string | null
        }
        Update: {
          id?: string
          campaign_id?: string
          influencer_id?: string
          proposed_rate?: number | null
          cover_letter?: string | null
          instagram_content_url?: string | null
          tiktok_content_url?: string | null
          status?: ApplicationStatus
          applied_at?: string
          reviewed_at?: string | null
          review_notes?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          campaign_id: string | null
          application_id: string | null
          amount: number
          fee: number
          net_amount: number
          payment_method: PaymentMethod
          status: TransactionStatus
          stripe_payment_intent_id: string | null
          paypal_transaction_id: string | null
          payment_details: Json | null
          processed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          campaign_id?: string | null
          submission_id?: string | null
          amount: number
          fee?: number
          net_amount: number
          payment_method: PaymentMethod
          status?: TransactionStatus
          stripe_payment_intent_id?: string | null
          paypal_transaction_id?: string | null
          payment_details?: Json | null
          processed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          campaign_id?: string | null
          submission_id?: string | null
          amount?: number
          fee?: number
          net_amount?: number
          payment_method?: PaymentMethod
          status?: TransactionStatus
          stripe_payment_intent_id?: string | null
          paypal_transaction_id?: string | null
          payment_details?: Json | null
          processed_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          data: Json | null
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          data?: Json | null
          read?: boolean
          created_at?: string
        }
      }
      campaign_view_tracking: {
        Row: {
          id: string
          campaign_id: string
          influencer_id: string
          application_id: string | null
          views_tracked: number
          last_checked_at: string | null
          payout_calculated: number
          payout_status: PayoutStatus
          instagram_views: number
          tiktok_views: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          influencer_id: string
          submission_id?: string | null
          views_tracked?: number
          last_checked_at?: string | null
          payout_calculated?: number
          payout_status?: PayoutStatus
          instagram_views?: number
          tiktok_views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          influencer_id?: string
          submission_id?: string | null
          views_tracked?: number
          last_checked_at?: string | null
          payout_calculated?: number
          payout_status?: PayoutStatus
          instagram_views?: number
          tiktok_views?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_reputation_score: {
        Args: { influencer_id: string }
        Returns: number
      }
      process_payout: {
        Args: {
          p_user_id: string
          p_amount: number
          p_payment_method: PaymentMethod
        }
        Returns: string
      }
      approve_submission: {
        Args: {
          p_submission_id: string
          p_review_notes?: string
        }
        Returns: boolean
      }
      get_campaign_stats: {
        Args: { p_campaign_id: string }
        Returns: {
          total_applications: number
          accepted_applications: number
          total_spent: number
        }
      }
    }
    Enums: {
      user_role: UserRole
      campaign_status: CampaignStatus
      application_status: ApplicationStatus
      submission_status: SubmissionStatus
      transaction_status: TransactionStatus
      payment_method: PaymentMethod
      platform_type: PlatformType
    }
  }
}