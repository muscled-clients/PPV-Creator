'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  validateACHAccount,
  createPlaidLinkToken,
  exchangePlaidToken,
  getPlaidAccountDetails,
  createDwollaCustomer,
  createDwollaFundingSource,
  initiateACHTransfer,
} from '@/lib/payments/ach-config'
import {
  validatePayPalEmail,
  createPayPalPayout,
  getPayPalPayoutBatch,
} from '@/lib/payments/paypal-config'
import {
  validateCryptoAddress,
  createCryptoCharge,
  getCryptoCharge,
} from '@/lib/payments/crypto-config'

// Payment method types
export type PaymentMethodType = 'ach' | 'paypal' | 'crypto'
export type CryptoType = 'BTC' | 'ETH' | 'USDC'

// Add payment method
export async function addPaymentMethod(data: {
  type: PaymentMethodType
  details: any
  isDefault?: boolean
}) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Validate payment method based on type
    let validationResult
    let processedDetails: any = {}

    switch (data.type) {
      case 'ach':
        validationResult = validateACHAccount(data.details)
        if (!validationResult.isValid) {
          return { success: false, error: validationResult.errors.join(', ') }
        }
        
        // Create Plaid link token for bank verification
        const linkTokenResult = await createPlaidLinkToken(user.id)
        if (!linkTokenResult.success) {
          return { success: false, error: linkTokenResult.error }
        }
        
        processedDetails = {
          ...data.details,
          plaidLinkToken: linkTokenResult.linkToken,
          verified: false,
        }
        break

      case 'paypal':
        validationResult = validatePayPalEmail(data.details.email)
        if (!validationResult.isValid) {
          return { success: false, error: validationResult.error }
        }
        processedDetails = { email: data.details.email }
        break

      case 'crypto':
        validationResult = validateCryptoAddress(
          data.details.address,
          data.details.currency
        )
        if (!validationResult.isValid) {
          return { success: false, error: validationResult.error }
        }
        processedDetails = {
          address: data.details.address,
          currency: data.details.currency,
        }
        break

      default:
        return { success: false, error: 'Invalid payment method type' }
    }

    // If setting as default, unset other defaults
    if (data.isDefault) {
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id)
    }

    // Save payment method to database
    const { data: paymentMethod, error: saveError } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.id,
        type: data.type,
        details: processedDetails,
        is_default: data.isDefault || false,
        status: 'active',
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save payment method error:', saveError)
      return { success: false, error: 'Failed to save payment method' }
    }

    revalidatePath('/influencer/payments/methods')
    revalidatePath('/brand/payments/methods')
    
    return { success: true, data: paymentMethod }
  } catch (error) {
    console.error('Add payment method error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Verify ACH bank account with Plaid
export async function verifyACHAccount(
  paymentMethodId: string,
  publicToken: string
) {
  try {
    const supabase = await createClient()
    
    // Exchange public token for access token
    const exchangeResult = await exchangePlaidToken(publicToken)
    if (!exchangeResult.success) {
      return { success: false, error: exchangeResult.error }
    }

    // Get account details
    const accountResult = await getPlaidAccountDetails(exchangeResult.accessToken!)
    if (!accountResult.success) {
      return { success: false, error: accountResult.error }
    }

    // Update payment method with verified details
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({
        details: {
          plaidAccessToken: exchangeResult.accessToken,
          plaidItemId: exchangeResult.itemId,
          accounts: accountResult.accounts,
          verified: true,
        },
        status: 'verified',
      })
      .eq('id', paymentMethodId)

    if (updateError) {
      console.error('Update payment method error:', updateError)
      return { success: false, error: 'Failed to verify account' }
    }

    return { success: true }
  } catch (error) {
    console.error('Verify ACH account error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get user's payment methods
export async function getPaymentMethods() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    const { data: methods, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get payment methods error:', error)
      return { success: false, error: 'Failed to fetch payment methods' }
    }

    return { success: true, data: methods || [] }
  } catch (error) {
    console.error('Get payment methods error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete payment method
export async function deletePaymentMethod(paymentMethodId: string) {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase
      .from('payment_methods')
      .update({ status: 'deleted' })
      .eq('id', paymentMethodId)

    if (error) {
      console.error('Delete payment method error:', error)
      return { success: false, error: 'Failed to delete payment method' }
    }

    revalidatePath('/influencer/payments/methods')
    revalidatePath('/brand/payments/methods')
    
    return { success: true }
  } catch (error) {
    console.error('Delete payment method error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Process payout for approved submission
export async function processPayout(data: {
  submissionId: string
  paymentMethodId: string
  amount: number
}) {
  try {
    const supabase = await createClient()
    
    // Get payment method details
    const { data: paymentMethod, error: methodError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('id', data.paymentMethodId)
      .single()

    if (methodError || !paymentMethod) {
      return { success: false, error: 'Payment method not found' }
    }

    // Create transaction record
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: paymentMethod.user_id,
        submission_id: data.submissionId,
        payment_method_id: data.paymentMethodId,
        amount: data.amount,
        currency: 'USD',
        type: 'payout',
        status: 'pending',
      })
      .select()
      .single()

    if (txError) {
      console.error('Create transaction error:', txError)
      return { success: false, error: 'Failed to create transaction' }
    }

    // Process payout based on payment method type
    let payoutResult
    
    switch (paymentMethod.type) {
      case 'ach':
        // Process ACH transfer via Dwolla
        payoutResult = await initiateACHTransfer(
          process.env.DWOLLA_MASTER_FUNDING_SOURCE!,
          paymentMethod.details.dwollaFundingSourceId,
          data.amount,
          { transactionId: transaction.id }
        )
        break

      case 'paypal':
        // Process PayPal payout
        payoutResult = await createPayPalPayout([{
          email: paymentMethod.details.email,
          amount: data.amount,
          senderItemId: transaction.id,
        }])
        break

      case 'crypto':
        // Create crypto charge for payout
        payoutResult = await createCryptoCharge({
          name: 'Payout',
          description: `Payout for submission ${data.submissionId}`,
          amount: data.amount,
          metadata: { transactionId: transaction.id },
        })
        break

      default:
        return { success: false, error: 'Unsupported payment method' }
    }

    if (!payoutResult.success) {
      // Update transaction status to failed
      await supabase
        .from('transactions')
        .update({ status: 'failed', error: payoutResult.error })
        .eq('id', transaction.id)
      
      return { success: false, error: payoutResult.error }
    }

    // Update transaction with processing details
    await supabase
      .from('transactions')
      .update({
        status: 'processing',
        external_id: (payoutResult as any).transferId || 
                     (payoutResult as any).batchId || 
                     (payoutResult as any).chargeId,
      })
      .eq('id', transaction.id)

    revalidatePath('/influencer/payments')
    revalidatePath('/brand/payments')
    
    return { success: true, data: transaction }
  } catch (error) {
    console.error('Process payout error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get transaction history
export async function getTransactions(filters?: {
  status?: string
  type?: string
  startDate?: Date
  endDate?: Date
}) {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    let query = supabase
      .from('transactions')
      .select(`
        *,
        submissions(
          id,
          campaign_id,
          campaigns(title)
        ),
        payment_methods(
          type,
          details
        )
      `)
      .eq('user_id', user.id)

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }

    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate.toISOString())
    }

    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate.toISOString())
    }

    const { data: transactions, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Get transactions error:', error)
      return { success: false, error: 'Failed to fetch transactions' }
    }

    return { success: true, data: transactions || [] }
  } catch (error) {
    console.error('Get transactions error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Get payment analytics
export async function getPaymentAnalytics() {
  try {
    const supabase = await createClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Get all transactions
    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)

    if (txError) {
      return { success: false, error: 'Failed to fetch analytics' }
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Calculate analytics
    const analytics = {
      totalEarnings: 0,
      thisMonthEarnings: 0,
      lastMonthEarnings: 0,
      pendingPayouts: 0,
      completedPayouts: 0,
      averagePayoutAmount: 0,
      paymentMethodBreakdown: { ach: 0, paypal: 0, crypto: 0 },
      monthlyTrend: [] as any[],
    }

    transactions?.forEach(tx => {
      if (tx.type === 'payout') {
        analytics.totalEarnings += tx.amount

        const txDate = new Date(tx.created_at)
        if (txDate >= thisMonth) {
          analytics.thisMonthEarnings += tx.amount
        } else if (txDate >= lastMonth && txDate < thisMonth) {
          analytics.lastMonthEarnings += tx.amount
        }

        if (tx.status === 'pending' || tx.status === 'processing') {
          analytics.pendingPayouts += tx.amount
        } else if (tx.status === 'completed') {
          analytics.completedPayouts += tx.amount
        }
      }
    })

    if (transactions && transactions.length > 0) {
      analytics.averagePayoutAmount = analytics.totalEarnings / transactions.length
    }

    // Calculate monthly growth
    const monthlyGrowth = analytics.lastMonthEarnings > 0
      ? ((analytics.thisMonthEarnings - analytics.lastMonthEarnings) / analytics.lastMonthEarnings) * 100
      : 0

    return {
      success: true,
      data: {
        ...analytics,
        monthlyGrowth: Number(monthlyGrowth.toFixed(2)),
      },
    }
  } catch (error) {
    console.error('Get payment analytics error:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Calculate platform fees
export function calculateFees(amount: number, paymentMethod: PaymentMethodType) {
  const platformFeeRate = 0.10 // 10% platform fee
  const processingFees: Record<PaymentMethodType, number> = {
    ach: 0.01,     // 1% for ACH
    paypal: 0.029, // 2.9% for PayPal
    crypto: 0.015, // 1.5% for crypto
  }

  const platformFee = amount * platformFeeRate
  const processingFee = amount * (processingFees[paymentMethod] || 0)
  const totalFees = platformFee + processingFee
  const netAmount = amount - totalFees

  return {
    gross: amount,
    platformFee: Number(platformFee.toFixed(2)),
    processingFee: Number(processingFee.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    net: Number(netAmount.toFixed(2)),
  }
}