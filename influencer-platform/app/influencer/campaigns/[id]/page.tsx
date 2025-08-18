import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApplicationFormWrapper } from '@/components/applications/application-form-wrapper'
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  FileText,
  Sparkles
} from 'lucide-react'

interface CampaignDetailsPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    apply?: string
  }>
}

export default async function CampaignDetailsPage({ params, searchParams }: CampaignDetailsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // Get user profile
  const { data: userData } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'influencer') {
    redirect('/auth/login')
  }

  // Get campaign with brand info
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select(`
      *,
      brand_profiles(
        company_name,
        avatar_url,
        description,
        website
      )
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (campaignError || !campaign) {
    console.error('Campaign fetch error:', campaignError)
    redirect('/influencer/campaigns')
  }

  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('campaign_applications')
    .select('id, status, created_at')
    .eq('campaign_id', resolvedParams.id)
    .eq('influencer_id', user.id)
    .single()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const isExpired = new Date(campaign.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isApplyMode = resolvedSearchParams.apply === 'true'

  // If in apply mode and haven't applied yet, show application form
  if (isApplyMode && !existingApplication && !isExpired) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/influencer/campaigns/${resolvedParams.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaign Details
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply to Campaign</h1>
            <p className="text-gray-600">{campaign.title}</p>
          </div>

          <ApplicationFormWrapper 
            campaign={campaign}
            campaignId={resolvedParams.id}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <Link
          href="/influencer/campaigns"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Link>

        {/* Campaign Status Alert */}
        {isExpired && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">This campaign has ended</p>
            </div>
          </div>
        )}

        {existingApplication && (
          <div className={`mb-6 p-4 rounded-lg border ${
            existingApplication.status === 'approved' 
              ? 'bg-green-50 border-green-200' 
              : existingApplication.status === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              {existingApplication.status === 'approved' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <p className="text-green-800">Your application has been approved!</p>
                </>
              ) : existingApplication.status === 'rejected' ? (
                <>
                  <XCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800">Your application was not selected</p>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800">Your application is under review</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
                
                {campaign.brand_profiles && (
                  <div className="flex items-center text-gray-600 mb-4">
                    <Building2 className="w-5 h-5 mr-2" />
                    <span className="font-medium">{campaign.brand_profiles.company_name}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {campaign.categories?.map((category: string, index: number) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-right ml-6">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  1K/{formatCurrency(campaign.cpm_rate || 0)}
                </div>
                <p className="text-sm text-gray-500">Pay per 1,000 views</p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600">
                    Max: {((campaign.max_views || 0) / 1000).toFixed(0)}K views
                  </p>
                  <p className="text-xs text-gray-500">
                    Total Budget: {formatCurrency(campaign.total_budget_calculated || campaign.budget_amount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Campaign Details */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                About This Campaign
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Requirements */}
            {campaign.requirements && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Requirements
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{campaign.requirements}</p>
              </div>
            )}

            {/* Deliverables */}
            {campaign.deliverables && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Deliverables
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap">{campaign.deliverables}</p>
              </div>
            )}

            {/* Campaign Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign Duration</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      <strong>Start:</strong> {formatDate(campaign.start_date)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      <strong>End:</strong> {formatDate(campaign.end_date)}
                    </span>
                  </div>
                  {!isExpired && (
                    <div className="flex items-center text-gray-700">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <strong>{daysLeft}</strong> days remaining
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Campaign Details</h3>
                <div className="space-y-2">
                  {campaign.platforms && campaign.platforms.length > 0 && (
                    <div className="flex items-center text-gray-700">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <strong>Platforms:</strong> {campaign.platforms.join(', ')}
                      </span>
                    </div>
                  )}
                  {campaign.target_audience && (
                    <div className="flex items-center text-gray-700">
                      <Target className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm">
                        <strong>Target Audience:</strong> {campaign.target_audience}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-700">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-sm">
                      <strong>Available Slots:</strong> {campaign.slots_available - campaign.slots_filled} of {campaign.slots_available}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Info */}
            {campaign.brand_profiles && campaign.brand_profiles.description && (
              <div className="pt-6 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  About {campaign.brand_profiles.company_name}
                </h2>
                <p className="text-gray-700 mb-3">{campaign.brand_profiles.description}</p>
                {campaign.brand_profiles.website && (
                  <a 
                    href={campaign.brand_profiles.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                {!existingApplication && !isExpired && (
                  <p className="text-sm text-gray-600">
                    Ready to collaborate? Apply now to join this campaign.
                  </p>
                )}
                {existingApplication && (
                  <p className="text-sm text-gray-600">
                    Applied on {new Date(existingApplication.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              
              {!existingApplication && !isExpired && campaign.status === 'active' && (
                <Link
                  href={`/influencer/campaigns/${resolvedParams.id}?apply=true`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Apply Now
                </Link>
              )}
              
              {existingApplication?.status === 'approved' && (
                <Link
                  href="/influencer/submissions/create"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Submit Content
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}