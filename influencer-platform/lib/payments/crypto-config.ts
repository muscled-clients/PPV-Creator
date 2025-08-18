import { Client, Webhook, resources } from 'coinbase-commerce-node'

// Initialize Coinbase Commerce client
if (process.env.COINBASE_COMMERCE_API_KEY) {
  Client.init(process.env.COINBASE_COMMERCE_API_KEY)
}

// Crypto Configuration
export const cryptoConfig = {
  minimumPayout: 10, // $10 minimum for crypto
  processingFee: 0.015, // 1.5% processing fee
  maxTransactionAmount: 50000, // $50,000 max per transaction
  supportedCurrencies: ['BTC', 'ETH', 'USDC'],
  confirmationsRequired: {
    BTC: 6,
    ETH: 12,
    USDC: 12,
  },
  estimatedProcessingMinutes: {
    BTC: 60, // ~1 hour for Bitcoin
    ETH: 5,  // ~5 minutes for Ethereum
    USDC: 5, // ~5 minutes for USDC
  },
}

// Wallet address validation patterns
const walletPatterns: Record<string, RegExp> = {
  BTC: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  USDC: /^0x[a-fA-F0-9]{40}$/, // USDC uses Ethereum addresses
}

// Validate crypto wallet address
export function validateCryptoAddress(
  address: string,
  currency: string
): { isValid: boolean; error?: string } {
  if (!address) {
    return { isValid: false, error: 'Wallet address is required' }
  }

  const pattern = walletPatterns[currency]
  if (!pattern) {
    return { isValid: false, error: `Unsupported currency: ${currency}` }
  }

  if (!pattern.test(address)) {
    return { isValid: false, error: `Invalid ${currency} wallet address format` }
  }

  return { isValid: true }
}

// Create a crypto charge (payment request)
export async function createCryptoCharge(data: {
  name: string
  description: string
  amount: number
  currency?: string
  metadata?: Record<string, any>
}) {
  try {
    const chargeData = {
      name: data.name,
      description: data.description,
      pricing_type: 'fixed_price' as const,
      local_price: {
        amount: data.amount.toString(),
        currency: data.currency || 'USD',
      },
      metadata: data.metadata || {},
    }

    const charge = await resources.Charge.create(chargeData)

    return {
      success: true,
      chargeId: charge.id,
      code: charge.code,
      hostedUrl: charge.hosted_url,
      addresses: charge.addresses,
      expiresAt: charge.expires_at,
    }
  } catch (error: any) {
    console.error('Crypto charge creation error:', error)
    return {
      success: false,
      error: error.message || 'Failed to create payment request',
    }
  }
}

// Get charge details
export async function getCryptoCharge(chargeId: string) {
  try {
    const charge = await resources.Charge.retrieve(chargeId)

    return {
      success: true,
      charge: {
        id: charge.id,
        code: charge.code,
        status: charge.timeline?.[charge.timeline.length - 1]?.status || 'NEW',
        payments: charge.payments,
        addresses: charge.addresses,
        pricing: charge.pricing,
        timeline: charge.timeline,
      },
    }
  } catch (error: any) {
    console.error('Get charge error:', error)
    return {
      success: false,
      error: error.message || 'Failed to retrieve charge',
    }
  }
}

// Cancel a charge
export async function cancelCryptoCharge(chargeId: string) {
  try {
    const charge = await resources.Charge.retrieve(chargeId)
    await charge.cancel()

    return {
      success: true,
      message: 'Charge cancelled successfully',
    }
  } catch (error: any) {
    console.error('Cancel charge error:', error)
    return {
      success: false,
      error: error.message || 'Failed to cancel charge',
    }
  }
}

// Verify webhook signature
export function verifyCryptoWebhook(
  rawBody: string,
  signature: string,
  sharedSecret: string
): boolean {
  try {
    Webhook.verifySigHeader(rawBody, signature, sharedSecret)
    return true
  } catch (error) {
    console.error('Webhook verification failed:', error)
    return false
  }
}

// Process webhook event
export async function processCryptoWebhook(event: any) {
  const eventHandlers: Record<string, (event: any) => Promise<void>> = {
    'charge:created': async (event) => {
      console.log('Charge created:', event.data.id)
      // Store charge details in database
    },
    'charge:confirmed': async (event) => {
      console.log('Payment confirmed:', event.data.id)
      // Update transaction status to confirmed
    },
    'charge:failed': async (event) => {
      console.log('Payment failed:', event.data.id)
      // Handle failed payment
    },
    'charge:delayed': async (event) => {
      console.log('Payment delayed:', event.data.id)
      // Handle delayed payment
    },
    'charge:pending': async (event) => {
      console.log('Payment pending:', event.data.id)
      // Update status to pending
    },
    'charge:resolved': async (event) => {
      console.log('Payment resolved:', event.data.id)
      // Finalize transaction
    },
  }

  const handler = eventHandlers[event.type]
  if (handler) {
    await handler(event)
  } else {
    console.log('Unhandled webhook event type:', event.type)
  }
}

// Calculate crypto fees
export function calculateCryptoFees(amount: number, currency: string): {
  gross: number
  platformFee: number
  networkFee: number
  net: number
} {
  const platformFee = amount * cryptoConfig.processingFee
  
  // Estimated network fees (these would be dynamic in production)
  const networkFees: Record<string, number> = {
    BTC: 5.00,  // ~$5 for Bitcoin
    ETH: 2.50,  // ~$2.50 for Ethereum
    USDC: 1.00, // ~$1 for USDC
  }
  
  const networkFee = networkFees[currency] || 0
  
  return {
    gross: amount,
    platformFee: Number(platformFee.toFixed(2)),
    networkFee: networkFee,
    net: Number((amount - platformFee - networkFee).toFixed(2)),
  }
}

// Validate crypto amount
export function validateCryptoAmount(amount: number): { isValid: boolean; error?: string } {
  if (amount < cryptoConfig.minimumPayout) {
    return {
      isValid: false,
      error: `Minimum payout amount is $${cryptoConfig.minimumPayout}`,
    }
  }
  
  if (amount > cryptoConfig.maxTransactionAmount) {
    return {
      isValid: false,
      error: `Maximum payout amount is $${cryptoConfig.maxTransactionAmount}`,
    }
  }
  
  return { isValid: true }
}

// Convert USD to crypto amount (mock implementation)
export async function convertUSDToCrypto(
  usdAmount: number,
  currency: string
): Promise<{ amount: number; rate: number }> {
  // In production, this would fetch real-time exchange rates
  const mockRates: Record<string, number> = {
    BTC: 43000,   // $43,000 per BTC
    ETH: 2200,    // $2,200 per ETH
    USDC: 1,      // $1 per USDC (stablecoin)
  }
  
  const rate = mockRates[currency] || 1
  const cryptoAmount = usdAmount / rate
  
  return {
    amount: Number(cryptoAmount.toFixed(8)),
    rate: rate,
  }
}

// Get estimated confirmation time
export function getEstimatedConfirmationTime(currency: string): number {
  return cryptoConfig.estimatedProcessingMinutes[currency as keyof typeof cryptoConfig.estimatedProcessingMinutes] || 60
}

// Check if currency is supported
export function isSupportedCurrency(currency: string): boolean {
  return cryptoConfig.supportedCurrencies.includes(currency)
}

// Generate payment QR code data
export function generatePaymentQRData(
  address: string,
  amount: number,
  currency: string
): string {
  // Format for crypto payment QR codes
  switch (currency) {
    case 'BTC':
      return `bitcoin:${address}?amount=${amount}`
    case 'ETH':
    case 'USDC':
      return `ethereum:${address}?value=${amount}`
    default:
      return address
  }
}