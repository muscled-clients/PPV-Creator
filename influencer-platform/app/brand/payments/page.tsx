import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

export default async function BrandPaymentsPage() {
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

  // Get transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      campaigns(title),
      user_profiles:influencer_id(full_name, email)
    `)
    .eq('brand_id', user.id)
    .order('created_at', { ascending: false })

  // Calculate statistics
  const totalSpent = transactions?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  const pendingPayments = transactions?.filter(t => t.status === 'pending') || []
  const completedPayments = transactions?.filter(t => t.status === 'completed') || []
  const failedPayments = transactions?.filter(t => t.status === 'failed') || []
  
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlySpent = transactions?.filter(t => {
    const date = new Date(t.created_at)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  }).reduce((sum, t) => sum + (t.amount || 0), 0) || 0

  // Mock payment methods (in production, this would come from a payment provider)
  const paymentMethods = [
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expiry: '12/25',
      isDefault: true
    },
    {
      id: '2',
      type: 'bank',
      bank: 'Chase Bank',
      last4: '6789',
      isDefault: false
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-2">
                Manage your payments and billing information
              </p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <CreditCard className="w-4 h-4 mr-2" />
                Add Payment Method
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">${monthlySpent.toLocaleString()}</h3>
            <p className="text-sm text-gray-600">This Month</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{pendingPayments.length}</h3>
            <p className="text-sm text-gray-600">Pending</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{completedPayments.length}</h3>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Status</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Last 30 days</option>
                  <option>Last 3 months</option>
                  <option>Last 6 months</option>
                  <option>This year</option>
                </select>
              </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg mr-4 ${
                            transaction.status === 'completed' ? 'bg-green-100' :
                            transaction.status === 'pending' ? 'bg-yellow-100' :
                            'bg-red-100'
                          }`}>
                            {transaction.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : transaction.status === 'pending' ? (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              Payment to {transaction.user_profiles?.full_name || 'Influencer'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Campaign: {transaction.campaigns?.title || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(transaction.created_at).toLocaleDateString()} at {new Date(transaction.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${transaction.amount?.toLocaleString()}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
                    <p className="text-gray-600">
                      Your payment history will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-6">
            {/* Payment Methods Card */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
              </div>
              <div className="p-6 space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      {method.type === 'card' ? (
                        <CreditCard className="w-8 h-8 text-gray-400 mr-3" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded mr-3" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {method.type === 'card' ? `${method.brand} ****${method.last4}` : `${method.bank} ****${method.last4}`}
                        </p>
                        {method.type === 'card' && (
                          <p className="text-sm text-gray-600">Expires {method.expiry}</p>
                        )}
                      </div>
                    </div>
                    {method.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                ))}
                <button className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  + Add Payment Method
                </button>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Billing Information</h2>
              </div>
              <div className="p-6 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Company Name</p>
                  <p className="font-medium text-gray-900">Your Brand Inc.</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Email</p>
                  <p className="font-medium text-gray-900">billing@yourbrand.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium text-gray-900">123 Business St, Suite 100</p>
                  <p className="font-medium text-gray-900">New York, NY 10001</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Edit Billing Information
                </button>
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <AlertCircle className="w-6 h-6 text-blue-600 mb-2" />
              <h3 className="font-semibold text-gray-900 mb-1">Need help with payments?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Our support team is here to help with any payment issues or questions.
              </p>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}