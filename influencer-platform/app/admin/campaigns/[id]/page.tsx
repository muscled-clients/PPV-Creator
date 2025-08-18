'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  Target, 
  Calendar,
  DollarSign,
  Building2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Edit,
  Trash2,
  Eye,
  FileText,
  TrendingUp,
  MessageSquare,
  Star
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Campaign {
  id: string
  title: string
  description: string
  brand_id: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  budget: number
  start_date: string
  end_date: string
  requirements?: string
  deliverables?: string
  target_audience?: string
  created_at: string
  updated_at: string
  brand_profiles?: {
    company_name: string
    company_description?: string
    website?: string
  }
}

interface Application {
  id: string
  campaign_id: string
  influencer_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  proposed_rate: number | null
  message?: string | null
  cover_letter?: string | null  // Some records might have this instead of message
  deliverables?: string | null
  instagram_content_url?: string | null
  tiktok_content_url?: string | null
  created_at: string
  influencer_profiles?: {
    user_profiles?: {
      full_name: string
      email: string
      avatar_url?: string
    }
    followers_count?: number
    engagement_rate?: number
    instagram_followers?: number
    tiktok_followers?: number
    instagram_engagement?: number
    tiktok_engagement?: number
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function CampaignDetailsPage({ params }: PageProps) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'analytics'>('overview')
  
  const supabase = createClient()

  useEffect(() => {
    if (resolvedParams?.id) {
      fetchCampaignDetails()
      fetchApplications()
    }
  }, [resolvedParams?.id])

  const fetchCampaignDetails = async () => {
    try {
      // First fetch the campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', resolvedParams.id)
        .single()

      if (campaignError) throw campaignError
      
      console.log('Campaign data fetched:', campaignData)

      // Then fetch the brand profile separately - try both user_id and id
      if (campaignData && campaignData.brand_id) {
        // First try with user_id
        let { data: brandData, error: brandError } = await supabase
          .from('brand_profiles')
          .select('company_name, description, website')
          .eq('user_id', campaignData.brand_id)
          .single()

        // If that fails, try with id
        if (brandError || !brandData) {
          const result = await supabase
            .from('brand_profiles')
            .select('company_name, description, website')
            .eq('id', campaignData.brand_id)
            .single()
          
          brandData = result.data
          brandError = result.error
        }

        if (!brandError && brandData) {
          campaignData.brand_profiles = {
            company_name: brandData.company_name,
            company_description: brandData.description,
            website: brandData.website
          }
        } else {
          console.log('Could not fetch brand profile:', brandError)
        }
      }

      setCampaign(campaignData)
    } catch (error) {
      console.error('Error fetching campaign:', error)
      toast.error('Failed to load campaign details')
    } finally {
      setLoading(false)
    }
  }

  const fetchApplications = async () => {
    try {
      console.log('Fetching applications for campaign:', resolvedParams.id)
      
      // Fetch applications - use created_at since applied_at doesn't exist
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('campaign_applications')
        .select('*')
        .eq('campaign_id', resolvedParams.id)
        .order('created_at', { ascending: false })

      if (applicationsError) {
        console.error('Supabase error fetching applications:', applicationsError)
        throw applicationsError
      }
      
      console.log('Applications data fetched:', applicationsData)

      // For each application, fetch influencer details
      if (applicationsData && applicationsData.length > 0) {
        const applicationsWithProfiles = await Promise.all(
          applicationsData.map(async (application) => {
            // Fetch influencer profile
            const { data: influencerData, error: influencerError } = await supabase
              .from('influencer_profiles')
              .select('instagram_followers, tiktok_followers, instagram_engagement, tiktok_engagement, user_id')
              .eq('user_id', application.influencer_id)
              .single()

            if (!influencerError && influencerData) {
              // Fetch user profile
              const { data: userData, error: userError } = await supabase
                .from('user_profiles')
                .select('full_name, email, avatar_url')
                .eq('id', application.influencer_id)
                .single()

              if (!userError && userData) {
                application.influencer_profiles = {
                  instagram_followers: influencerData.instagram_followers,
                  tiktok_followers: influencerData.tiktok_followers,
                  instagram_engagement: influencerData.instagram_engagement,
                  tiktok_engagement: influencerData.tiktok_engagement,
                  followers_count: (influencerData.instagram_followers || 0) + (influencerData.tiktok_followers || 0),
                  engagement_rate: Math.max(influencerData.instagram_engagement || 0, influencerData.tiktok_engagement || 0),
                  user_profiles: userData
                }
              }
            }

            return application
          })
        )
        setApplications(applicationsWithProfiles)
      } else {
        setApplications([])
      }
    } catch (error: any) {
      console.error('Error fetching applications:', error)
      console.error('Error details:', error?.message || 'Unknown error')
      console.error('Error code:', error?.code)
      // Don't throw, just set empty applications
      setApplications([])
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!campaign) return

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaign.id)

      if (error) throw error

      toast.success(`Campaign status updated to ${newStatus}`)
      fetchCampaignDetails()
    } catch (error) {
      console.error('Error updating campaign status:', error)
      toast.error('Failed to update campaign status')
    }
  }

  const handleApplicationStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('campaign_applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      toast.success(`Application ${newStatus === 'accepted' ? 'accepted' : 'rejected'}`)
      fetchApplications()
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Active
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            <Edit className="w-4 h-4 mr-1" />
            Draft
          </span>
        )
      case 'paused':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-4 h-4 mr-1" />
            Paused
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="w-4 h-4 mr-1" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatBudget = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00'
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 animate-pulse">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <p className="mt-4 text-gray-500">Loading campaign details...</p>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-gray-500">Campaign not found</p>
          <button
            onClick={() => router.push('/admin/campaigns')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/admin/campaigns')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Campaigns
          </button>
          
          <div className="flex items-center gap-3">
            {campaign.status === 'active' ? (
              <button
                onClick={() => handleStatusChange('paused')}
                className="px-4 py-2 border border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50"
              >
                <AlertCircle className="w-4 h-4 inline mr-2" />
                Pause Campaign
              </button>
            ) : campaign.status === 'paused' ? (
              <button
                onClick={() => handleStatusChange('active')}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Activate Campaign
              </button>
            ) : null}
            
            {campaign.status === 'draft' && (
              <button
                onClick={() => handleStatusChange('active')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Publish Campaign
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
            <div className="flex items-center gap-4 mt-3">
              {getStatusBadge(campaign.status)}
              <div className="flex items-center text-gray-500">
                <Building2 className="w-4 h-4 mr-1" />
                <span className="text-sm">{campaign.brand_profiles?.company_name}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                <span className="text-sm">Created {formatDate(campaign.created_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('applications')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'applications'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Applications ({applications.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Description</label>
                      <p className="mt-1 text-gray-900">{campaign.description}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Requirements</label>
                      <p className="mt-1 text-gray-900">{campaign.requirements || 'No specific requirements'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Deliverables</label>
                      <p className="mt-1 text-gray-900">{campaign.deliverables || 'No deliverables specified'}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Target Audience</label>
                      <p className="mt-1 text-gray-900">{campaign.target_audience || 'Not specified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Budget</p>
                          <p className="text-lg font-semibold text-gray-900">{formatBudget(campaign.budget)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 text-purple-600 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Applications</p>
                          <p className="text-lg font-semibold text-gray-900">{applications.length} total</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          {application.influencer_profiles?.user_profiles?.avatar_url ? (
                            <img
                              src={application.influencer_profiles.user_profiles.avatar_url}
                              alt=""
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {application.influencer_profiles?.user_profiles?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                          )}
                          
                          <div className="ml-4">
                            <h4 className="font-semibold text-gray-900">
                              {application.influencer_profiles?.user_profiles?.full_name || 'Unknown'}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {application.influencer_profiles?.user_profiles?.email}
                            </p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-600">
                                <Users className="w-4 h-4 inline mr-1" />
                                {application.influencer_profiles?.followers_count || 0} followers
                              </span>
                              <span className="text-sm text-gray-600">
                                <TrendingUp className="w-4 h-4 inline mr-1" />
                                {application.influencer_profiles?.engagement_rate || 0}% engagement
                              </span>
                              {application.proposed_rate && (
                                <span className="text-sm font-semibold text-green-600">
                                  {formatBudget(application.proposed_rate)}
                                </span>
                              )}
                            </div>
                            <p className="mt-2 text-sm text-gray-700">{application.message || application.cover_letter || 'No message provided'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {application.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApplicationStatusChange(application.id, 'accepted')}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApplicationStatusChange(application.id, 'rejected')}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          
                          {application.status === 'accepted' && (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              Accepted
                            </span>
                          )}
                          
                          {application.status === 'rejected' && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Analytics coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}