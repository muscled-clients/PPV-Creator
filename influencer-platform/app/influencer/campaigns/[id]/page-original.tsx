import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCampaignById } from '@/lib/actions/campaign-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ApplicationForm } from '@/components/applications/application-form'
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Building2,
  Target,
  Instagram,
  Music,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import Link from 'next/link'

interface CampaignDetailsPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    apply?: string
  }>
}

export default async function InfluencerCampaignDetailsPage({ 
  params, 
  searchParams 
}: CampaignDetailsPageProps) {
  const resolvedParams = await params
  const resolvedSearchParams = await searchParams
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is an influencer
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'influencer') {
    redirect('/auth/login')
  }

  // Get campaign details
  const result = await getCampaignById(resolvedParams.id, 'influencer', user.id)
  
  if (!result.success || !result.data) {
    console.error('Failed to get campaign:', result.error)
    console.error('Campaign ID:', resolvedParams.id)
    console.error('User ID:', user.id)
    redirect('/influencer/campaigns')
  }

  const campaign = result.data

  // Check if user has already applied
  const { data: existingApplication } = await supabase
    .from('campaign_applications')
    .select('id, status')
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

  const isExpired = new Date(campaign.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const isApplyMode = resolvedSearchParams.apply === 'true'

  if (isApplyMode && !existingApplication) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ApplicationForm campaign={campaign} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/influencer/campaigns"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{campaign.title}</h1>
              <div className="flex items-center space-x-4 text-gray-600">
                <div className="flex items-center space-x-1">
                  <Building2 className="w-4 h-4" />
                  <span>{campaign.brand_profiles?.company_name || 'Brand'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{isExpired ? 'Campaign ended' : `${daysLeft} days remaining`}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                ${campaign.budget_amount.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Total Budget</div>
            </div>
          </div>
        </div>

        {/* Application Status Banner */}
        {existingApplication && (
          <div className={`rounded-lg p-4 mb-6 ${
            existingApplication.status === 'approved' ? 'bg-green-50 border border-green-200' :
            existingApplication.status === 'pending' ? 'bg-yellow-50 border border-yellow-200' :
            existingApplication.status === 'rejected' ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center space-x-2">
              {existingApplication.status === 'approved' && <CheckCircle className="w-5 h-5 text-green-600" />}
              {existingApplication.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
              {existingApplication.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
              {existingApplication.status === 'withdrawn' && <XCircle className="w-5 h-5 text-gray-600" />}
              
              <div>
                <h3 className={`font-medium ${
                  existingApplication.status === 'approved' ? 'text-green-900' :
                  existingApplication.status === 'pending' ? 'text-yellow-900' :
                  existingApplication.status === 'rejected' ? 'text-red-900' :
                  'text-gray-900'
                }`}>
                  {existingApplication.status === 'approved' && 'Application Approved! 🎉'}
                  {existingApplication.status === 'pending' && 'Application Under Review'}
                  {existingApplication.status === 'rejected' && 'Application Not Selected'}
                  {existingApplication.status === 'withdrawn' && 'Application Withdrawn'}
                </h3>
                <p className={`text-sm ${
                  existingApplication.status === 'approved' ? 'text-green-700' :
                  existingApplication.status === 'pending' ? 'text-yellow-700' :
                  existingApplication.status === 'rejected' ? 'text-red-700' :
                  'text-gray-700'
                }`}>
                  {existingApplication.status === 'approved' && 'Congratulations! The brand has selected you for this campaign.'}
                  {existingApplication.status === 'pending' && 'Your application is being reviewed by the brand. We\'ll notify you of any updates.'}
                  {existingApplication.status === 'rejected' && 'Unfortunately, your application was not selected this time. Keep applying to other campaigns!'}
                  {existingApplication.status === 'withdrawn' && 'You have withdrawn your application for this campaign.'}
                </p>
              </div>
            </div>
            
            {existingApplication.status === 'approved' && (
              <div className="mt-4">
                <Link
                  href={`/influencer/applications/${existingApplication.id}`}
                  className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Application Details →
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About This Campaign</h2>
              <p className="text-gray-700 leading-relaxed">{campaign.description}</p>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <Target className="w-5 h-5 inline mr-2" />
                Influencer Requirements
              </h2>
              <p className="text-gray-700 leading-relaxed">{campaign.requirements}</p>
            </div>

            {/* Deliverables */}
            {campaign.deliverables && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Expected Deliverables</h2>
                <p className="text-gray-700 leading-relaxed">{campaign.deliverables}</p>
              </div>
            )}

            {/* Target Audience */}
            {campaign.target_audience && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  <Users className="w-5 h-5 inline mr-2" />
                  Target Audience
                </h2>
                <p className="text-gray-700 leading-relaxed">{campaign.target_audience}</p>
              </div>
            )}

            {/* Brand Information */}
            {campaign.brand_profiles && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Brand</h2>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{campaign.brand_profiles.company_name}</h3>
                    {campaign.brand_profiles.description && (
                      <p className="text-gray-600 mt-1">{campaign.brand_profiles.description}</p>
                    )}
                    {campaign.brand_profiles.website && (
                      <a
                        href={campaign.brand_profiles.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Application CTA */}
            {!existingApplication && campaign.status === 'active' && !isExpired && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
                <h3 className="font-semibold text-primary-900 mb-2">Ready to Apply?</h3>
                <p className="text-primary-700 text-sm mb-4">
                  This campaign matches your profile. Submit your application to get selected!
                </p>
                <Link
                  href={`/influencer/campaigns/${campaign.id}?apply=true`}
                  className="block w-full bg-primary-600 text-white text-center py-3 px-4 rounded-md hover:bg-primary-700 transition-colors font-medium"
                >
                  Apply Now
                </Link>
              </div>
            )}

            {/* Campaign Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign Timeline</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">Start Date</div>
                  <div className="text-sm text-gray-600">{formatDate(campaign.start_date)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900">End Date</div>
                  <div className="text-sm text-gray-600">{formatDate(campaign.end_date)}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-900">Status</div>
                  <div className={`text-sm ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
                    {isExpired ? 'Campaign Ended' : `${daysLeft} days remaining`}
                  </div>
                </div>
              </div>
            </div>

            {/* Platforms */}
            {campaign.platforms && campaign.platforms.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Target Platforms</h3>
                <div className="space-y-3">
                  {campaign.platforms.map((platform, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      {platform === 'instagram' && <Instagram className="w-5 h-5 text-pink-500" />}
                      {platform === 'tiktok' && <Music className="w-5 h-5 text-black" />}
                      <span className="text-gray-700 capitalize font-medium">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {campaign.categories && campaign.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Content Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium text-gray-900">${campaign.budget_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applications</span>
                  <span className="font-medium text-gray-900">{campaign.applications?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-gray-900">
                    {campaign.applications?.filter(app => app.status === 'approved').length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}