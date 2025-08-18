import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApplicationManager } from '@/components/applications/application-manager'
import { 
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search
} from 'lucide-react'

export default async function BrandApplicationsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is a brand
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'brand') {
    redirect('/auth/login')
  }

  // First get brand's campaigns
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('brand_id', user.id)

  const campaignIds = campaigns?.map(c => c.id) || []

  // Get all applications for brand's campaigns
  const { data: applications, error: applicationsError } = await supabase
    .from('campaign_applications')
    .select(`
      *,
      campaigns(
        id,
        title,
        budget_amount,
        brand_id
      )
    `)
    .in('campaign_id', campaignIds)
    .order('created_at', { ascending: false })

  // Log any errors for debugging
  if (applicationsError) {
    console.error('Error fetching applications:', applicationsError)
  }
  console.log('Applications found:', applications?.length || 0)

  // Get influencer profiles separately if we have applications
  let enrichedApplications = applications || []
  if (applications && applications.length > 0) {
    // Get unique influencer IDs
    const influencerIds = [...new Set(applications.map(app => app.influencer_id))]
    
    // Fetch user profiles
    const { data: userProfiles } = await supabase
      .from('user_profiles')
      .select('*')
      .in('id', influencerIds)
    
    // Fetch influencer profiles
    const { data: influencerProfiles } = await supabase
      .from('influencer_profiles')
      .select('*')
      .in('user_id', influencerIds)
    
    // Merge the data
    enrichedApplications = applications.map(app => ({
      ...app,
      user_profiles: userProfiles?.find(u => u.id === app.influencer_id),
      influencer_profiles: influencerProfiles?.find(i => i.user_id === app.influencer_id)
    }))
  }

  // Group applications by status
  const pendingApplications = enrichedApplications?.filter(app => app.status === 'pending') || []
  const approvedApplications = enrichedApplications?.filter(app => app.status === 'approved') || []
  const rejectedApplications = enrichedApplications?.filter(app => app.status === 'rejected') || []

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
              <p className="text-gray-600 mt-2">
                Review and manage applications from influencers
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-xl font-bold text-gray-900">{enrichedApplications?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900">{pendingApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Approved</p>
                <p className="text-xl font-bold text-gray-900">{approvedApplications.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Rejected</p>
                <p className="text-xl font-bold text-gray-900">{rejectedApplications.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {/* Pending Applications */}
          {pendingApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                Pending Applications ({pendingApplications.length})
              </h2>
              <ApplicationManager 
                applications={pendingApplications} 
                userRole="brand" 
              />
            </div>
          )}

          {/* Approved Applications */}
          {approvedApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                Approved Applications ({approvedApplications.length})
              </h2>
              <ApplicationManager 
                applications={approvedApplications} 
                userRole="brand" 
              />
            </div>
          )}

          {/* Rejected Applications */}
          {rejectedApplications.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <XCircle className="w-5 h-5 text-red-600 mr-2" />
                Rejected Applications ({rejectedApplications.length})
              </h2>
              <ApplicationManager 
                applications={rejectedApplications} 
                userRole="brand" 
              />
            </div>
          )}

          {/* Empty State */}
          {enrichedApplications?.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No applications yet
              </h3>
              <p className="text-gray-600 mb-6">
                Applications will appear here when influencers apply to your campaigns
              </p>
              <Link
                href="/brand/campaigns"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Campaigns
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}