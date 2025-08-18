import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Download,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  AlertCircle,
  Plus
} from 'lucide-react'

export default async function EarningsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Get all transactions
  const { data: transactions } = await supabase
    .from('transactions')
    .select(`
      *,
      submissions(
        id,
        campaigns(title, brand_profiles(company_name))
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get payment methods
  const { data: paymentMethods } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Calculate statistics
  const totalEarnings = transactions?.reduce((sum, t) => {
    if (t.type === 'earning' && t.status === 'completed') return sum + t.amount
    return sum
  }, 0) || 0

  const pendingEarnings = transactions?.reduce((sum, t) => {
    if (t.type === 'earning' && t.status === 'pending') return sum + t.amount
    return sum
  }, 0) || 0

  const totalWithdrawals = transactions?.reduce((sum, t) => {
    if (t.type === 'withdrawal' && t.status === 'completed') return sum + t.amount
    return sum
  }, 0) || 0

  const availableBalance = totalEarnings - totalWithdrawals

  // Get recent transactions (last 10)
  const recentTransactions = transactions?.slice(0, 10) || []

  // Group transactions by month for chart data
  const monthlyEarnings = transactions?.reduce((acc: any, t) => {
    if (t.type === 'earning' && t.status === 'completed') {
      const month = new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      acc[month] = (acc[month] || 0) + t.amount
    }
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mr-4">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings & Payments</h1>
              <p className="text-gray-600">Manage your earnings and payment methods</p>
            </div>
          </div>
          <Link
            href="/influencer/earnings/withdraw"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Request Withdrawal
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${availableBalance.toFixed(2)}</h3>
          <p className="text-sm text-gray-600 mt-1">Available Balance</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${pendingEarnings.toFixed(2)}</h3>
          <p className="text-sm text-gray-600 mt-1">Pending Earnings</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${totalEarnings.toFixed(2)}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Earned</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-purple-600" />
            </div>
            <ArrowDownRight className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">${totalWithdrawals.toFixed(2)}</h3>
          <p className="text-sm text-gray-600 mt-1">Total Withdrawn</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
              <Link
                href="/influencer/earnings/history"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View All →
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                        transaction.type === 'earning' 
                          ? 'bg-green-100' 
                          : 'bg-red-100'
                      }`}>
                        {transaction.type === 'earning' ? (
                          <ArrowUpRight className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {transaction.type === 'earning' ? 'Earned from' : 'Withdrawal'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.submissions?.campaigns?.title || transaction.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'earning' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'earning' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        transaction.status === 'completed' 
                          ? 'bg-green-100 text-green-700'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No transactions yet</p>
                <p className="text-sm mt-1">Complete campaigns to start earning</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
              <Link
                href="/influencer/settings/payments"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Manage
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {paymentMethods && paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {method.type === 'bank_account' ? 'Bank Account' : 
                           method.type === 'paypal' ? 'PayPal' : 
                           'Crypto Wallet'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {method.type === 'bank_account' 
                            ? `****${method.details?.account_number?.slice(-4)}`
                            : method.details?.email || method.details?.wallet_address?.slice(0, 10) + '...'}
                        </p>
                      </div>
                    </div>
                    {method.is_default && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Default
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 mb-3">No payment methods added</p>
                <Link
                  href="/influencer/settings/payments"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-900">Withdrawal Information</h3>
            <p className="text-sm text-blue-800 mt-1">
              Minimum withdrawal amount is $50. Withdrawals are processed within 3-5 business days.
              Make sure to add and verify your payment method before requesting a withdrawal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}