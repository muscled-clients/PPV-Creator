import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApplicationManager } from '@/components/applications/application-manager'
import { 
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react'

export default async function InfluencerApplicationsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Verify user is an influencer
  const { data: userData, error: userError } = await supabase
    .from('user_profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (userError || !userData || userData.role !== 'influencer') {
    redirect('/auth/login')
  }

  // Get all applications for the influencer
  const { data: applications, error: applicationsError } = await supabase
    .from('campaign_applications')
    .select(`
      *,
      campaigns(
        id,
        title,
        description,
        budget_amount,
        brand_id,
        end_date,
        status
      )
    `)
    .eq('influencer_id', user.id)
    .order('created_at', { ascending: false })

  // Group applications by status
  const pendingApplications = applications?.filter(app => app.status === 'pending') || []
  const approvedApplications = applications?.filter(app => app.status === 'approved') || []
  const rejectedApplications = applications?.filter(app => app.status === 'rejected') || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="text-gray-600">Track your campaign applications</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{applications?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Success Rate</p>
              <p className="text-xl font-bold text-gray-900">
                {applications && applications.length > 0
                  ? Math.round((approvedApplications.length / applications.length) * 100)
                  : 0}%
              </p>
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
              userRole="influencer" 
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
              userRole="influencer" 
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
              userRole="influencer" 
            />
          </div>
        )}

        {/* Empty State */}
        {applications?.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start applying to campaigns to see your applications here
            </p>
            <Link
              href="/influencer/campaigns"
              className="inline-flex items-center bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Browse Campaigns
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}