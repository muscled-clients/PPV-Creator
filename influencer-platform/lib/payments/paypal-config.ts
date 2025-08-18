import paypal from '@paypal/payouts-sdk'

// PayPal Environment Configuration
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || ''
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''
  
  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

// PayPal Client
export const paypalClient = new paypal.core.PayPalHttpClient(environment())

// PayPal Configuration
export const paypalConfig = {
  minimumPayout: 25, // $25 minimum for PayPal
  processingFee: 0.029, // 2.9% processing fee
  maxTransactionAmount: 20000, // $20,000 max per transaction
  instantPayout: true,
  supportedCurrencies: ['USD'],
  estimatedProcessingMinutes: 5,
}

// Validate PayPal email
export function validatePayPalEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }
  
  return { isValid: true }
}

// Create PayPal payout batch
export async function createPayPalPayout(payouts: Array<{
  email: string
  amount: number
  note?: string
  recipientType?: 'EMAIL' | 'PHONE' | 'PAYPAL_ID'
  senderItemId?: string
}>) {
  try {
    const request = new paypal.payouts.PayoutsPostRequest()
    
    const batchId = `batch_${Date.now()}`
    
    request.requestBody({
      sender_batch_header: {
        sender_batch_id: batchId,
        recipient_type: 'EMAIL',
        email_subject: 'You have received a payment!',
        email_message: 'You have received a payment from our platform for your content submission.',
      },
      items: payouts.map((payout, index) => ({
        recipient_type: payout.recipientType || 'EMAIL',
        amount: {
          value: payout.amount.toFixed(2),
          currency: 'USD',
        },
        receiver: payout.email,
        note: payout.note || 'Payment for approved content submission',
        sender_item_id: payout.senderItemId || `item_${index}_${Date.now()}`,
      })),
    })
    
    const response = await paypalClient.execute(request)
    
    return {
      success: true,
      batchId: response.result.batch_header.payout_batch_id,
      batchStatus: response.result.batch_header.batch_status,
      items: response.result.items,
    }
  } catch (error: any) {
    console.error('PayPal payout error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create payout',
    }
  }
}

// Get PayPal payout batch status
export async function getPayPalPayoutBatch(batchId: string) {
  try {
    const request = new paypal.payouts.PayoutsGetRequest(batchId)
    const response = await paypalClient.execute(request)
    
    return {
      success: true,
      batchHeader: response.result.batch_header,
      items: response.result.items,
      totalAmount: response.result.batch_header.amount,
      status: response.result.batch_header.batch_status,
    }
  } catch (error: any) {
    console.error('PayPal batch status error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get batch status',
    }
  }
}

// Get individual payout item status
export async function getPayPalPayoutItem(payoutItemId: string) {
  try {
    const request = new paypal.payouts.PayoutsItemGetRequest(payoutItemId)
    const response = await paypalClient.execute(request)
    
    return {
      success: true,
      item: response.result.payout_item,
      status: response.result.transaction_status,
      transactionId: response.result.transaction_id,
    }
  } catch (error: any) {
    console.error('PayPal item status error:', error)
    return {
      success: false,
      error: error.message || 'Failed to get item status',
    }
  }
}

// Cancel unclaimed PayPal payout
export async function cancelPayPalPayout(payoutItemId: string) {
  try {
    const request = new paypal.payouts.PayoutsItemCancelRequest(payoutItemId)
    const response = await paypalClient.execute(request)
    
    return {
      success: true,
      item: response.result.payout_item,
      status: response.result.transaction_status,
    }
  } catch (error: any) {
    console.error('PayPal cancel error:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel payout',
    }
  }
}

// Verify PayPal webhook signature
export function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: any,
  webhookId: string
): boolean {
  try {
    const transmissionId = headers['paypal-transmission-id']
    const transmissionTime = headers['paypal-transmission-time']
    const certUrl = headers['paypal-cert-url']
    const authAlgo = headers['paypal-auth-algo']
    const transmissionSig = headers['paypal-transmission-sig']
    
    // In production, implement proper webhook verification
    // using PayPal's webhook verification API
    // For now, return true in development
    if (process.env.NODE_ENV !== 'production') {
      return true
    }
    
    // TODO: Implement production webhook verification
    return false
  } catch (error) {
    console.error('PayPal webhook verification error:', error)
    return false
  }
}

// Process PayPal webhook event
export async function processPayPalWebhook(eventType: string, resource: any) {
  const eventHandlers: Record<string, (resource: any) => Promise<void>> = {
    'PAYMENT.PAYOUTSBATCH.SUCCESS': async (resource) => {
      console.log('Payout batch successful:', resource.batch_header.payout_batch_id)
      // Update transaction status in database
    },
    'PAYMENT.PAYOUTSBATCH.DENIED': async (resource) => {
      console.log('Payout batch denied:', resource.batch_header.payout_batch_id)
      // Handle denied payout
    },
    'PAYMENT.PAYOUTS-ITEM.SUCCEEDED': async (resource) => {
      console.log('Payout item successful:', resource.payout_item_id)
      // Update individual transaction status
    },
    'PAYMENT.PAYOUTS-ITEM.FAILED': async (resource) => {
      console.log('Payout item failed:', resource.payout_item_id)
      // Handle failed payout item
    },
    'PAYMENT.PAYOUTS-ITEM.UNCLAIMED': async (resource) => {
      console.log('Payout unclaimed:', resource.payout_item_id)
      // Handle unclaimed payout
    },
  }
  
  const handler = eventHandlers[eventType]
  if (handler) {
    await handler(resource)
  } else {
    console.log('Unhandled PayPal event type:', eventType)
  }
}

// Calculate PayPal fees
export function calculatePayPalFees(amount: number): {
  gross: number
  fee: number
  net: number
} {
  const fee = amount * paypalConfig.processingFee
  return {
    gross: amount,
    fee: Number(fee.toFixed(2)),
    net: Number((amount - fee).toFixed(2)),
  }
}

// Validate payout amount
export function validatePayPalAmount(amount: number): { isValid: boolean; error?: string } {
  if (amount < paypalConfig.minimumPayout) {
    return {
      isValid: false,
      error: `Minimum payout amount is $${paypalConfig.minimumPayout}`,
    }
  }
  
  if (amount > paypalConfig.maxTransactionAmount) {
    return {
      isValid: false,
      error: `Maximum payout amount is $${paypalConfig.maxTransactionAmount}`,
    }
  }
  
  return { isValid: true }
}