import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCampaignById } from '@/lib/actions/campaign-actions'
import { CampaignDetailActions } from '@/components/campaigns/campaign-detail-actions'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Eye,
  Instagram,
  Music
} from 'lucide-react'
import Link from 'next/link'

interface CampaignDetailsPageProps {
  params: {
    id: string
  }
}

export default async function CampaignDetailsPage({ params }: CampaignDetailsPageProps) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is a brand
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'brand') {
    redirect('/auth/login')
  }

  // Get campaign details
  const result = await getCampaignById(params.id, 'brand', user.id)
  
  if (!result.success || !result.data) {
    redirect('/brand/campaigns')
  }

  const campaign = result.data

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const applications = campaign.campaign_applications || []
  const pendingApplications = applications.filter(app => app.status === 'pending')
  const approvedApplications = applications.filter(app => app.status === 'approved')
  const rejectedApplications = applications.filter(app => app.status === 'rejected')

  const isExpired = new Date(campaign.end_date) < new Date()
  const daysLeft = Math.ceil((new Date(campaign.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/brand/campaigns"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
          
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{campaign.title}</h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-gray-600">
                {isExpired ? 'Campaign ended' : `${daysLeft} days remaining`}
              </p>
            </div>
            
            <CampaignDetailActions campaign={campaign} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Campaign Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">${campaign.budget_amount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Budget</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{applications.length}</div>
                  <div className="text-sm text-gray-500">Applications</div>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">{approvedApplications.length}</div>
                  <div className="text-sm text-gray-500">Approved</div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{campaign.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                  <p className="text-gray-700">{campaign.requirements}</p>
                </div>
                
                {campaign.deliverables && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Expected Deliverables</h3>
                    <p className="text-gray-700">{campaign.deliverables}</p>
                  </div>
                )}
                
                {campaign.target_audience && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Target Audience</h3>
                    <p className="text-gray-700">{campaign.target_audience}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Applications */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
                <Link
                  href={`/brand/campaigns/${campaign.id}/applications`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All →
                </Link>
              </div>

              {applications.length > 0 ? (
                <div className="space-y-4">
                  {/* Application Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xl font-bold text-yellow-800">{pendingApplications.length}</div>
                      <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-xl font-bold text-green-800">{approvedApplications.length}</div>
                      <div className="text-sm text-green-600">Approved</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-xl font-bold text-red-800">{rejectedApplications.length}</div>
                      <div className="text-sm text-red-600">Rejected</div>
                    </div>
                  </div>

                  {/* Recent Applications Preview */}
                  <div className="space-y-3">
                    {applications.slice(0, 3).map((application) => (
                      <div key={application.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {application.users?.full_name || 'Influencer'}
                            </p>
                            <p className="text-sm text-gray-500">
                              Applied {new Date(application.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status}
                          </span>
                          <Link
                            href={`/brand/applications/${application.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications yet</p>
                  <p className="text-sm text-gray-400">Applications will appear here once influencers apply</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Campaign Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Start Date</div>
                    <div className="text-sm text-gray-600">{formatDate(campaign.start_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">End Date</div>
                    <div className="text-sm text-gray-600">{formatDate(campaign.end_date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Budget</div>
                    <div className="text-sm text-gray-600">${campaign.budget_amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platforms */}
            {campaign.platforms && campaign.platforms.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Target Platforms</h3>
                <div className="space-y-2">
                  {campaign.platforms.map((platform, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      {platform === 'instagram' && <Instagram className="w-4 h-4 text-pink-500" />}
                      {platform === 'tiktok' && <Music className="w-4 h-4 text-black" />}
                      <span className="text-sm text-gray-700 capitalize">{platform}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {campaign.categories && campaign.categories.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {campaign.categories.map((category, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/brand/campaigns/${campaign.id}/applications`}
                  className="block w-full text-center bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
                >
                  View Applications
                </Link>
                <Link
                  href={`/brand/campaigns/${campaign.id}/analytics`}
                  className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                >
                  View Analytics
                </Link>
                {campaign.status === 'draft' && (
                  <Link
                    href={`/brand/campaigns/${campaign.id}/edit`}
                    className="block w-full text-center bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Edit Campaign
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}