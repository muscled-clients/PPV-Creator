import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'
import { Client as DwollaClient } from 'dwolla-v2'

// Plaid Configuration for bank account linking
const plaidConfiguration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
    },
  },
})

export const plaidClient = new PlaidApi(plaidConfiguration)

// Dwolla Configuration for ACH transfers
export const dwollaClient = new DwollaClient({
  key: process.env.DWOLLA_KEY || '',
  secret: process.env.DWOLLA_SECRET || '',
  environment: process.env.DWOLLA_ENV || 'sandbox',
})

// ACH Configuration
export const achConfig = {
  minimumPayout: 50, // $50 minimum for ACH
  processingFee: 0.01, // 1% processing fee
  maxTransactionAmount: 10000, // $10,000 max per transaction
  supportedAccountTypes: ['checking', 'savings'],
  verificationRequired: true,
  estimatedProcessingDays: 3,
}

// Validate ACH account details
export function validateACHAccount(account: {
  accountNumber: string
  routingNumber: string
  accountType: string
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate account number
  if (!account.accountNumber || account.accountNumber.length < 4) {
    errors.push('Account number must be at least 4 digits')
  }

  // Validate routing number (9 digits)
  if (!account.routingNumber || !/^\d{9}$/.test(account.routingNumber)) {
    errors.push('Routing number must be exactly 9 digits')
  }

  // Validate account type
  if (!achConfig.supportedAccountTypes.includes(account.accountType)) {
    errors.push(`Account type must be one of: ${achConfig.supportedAccountTypes.join(', ')}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Create Plaid Link token for bank account connection
export async function createPlaidLinkToken(userId: string) {
  try {
    const response = await plaidClient.linkTokenCreate({
      client_id: process.env.PLAID_CLIENT_ID!,
      secret: process.env.PLAID_SECRET!,
      user: {
        client_user_id: userId,
      },
      client_name: 'Influencer Platform',
      products: ['auth', 'transactions'],
      country_codes: ['US'],
      language: 'en',
      webhook: process.env.PLAID_WEBHOOK_URL,
    })

    return {
      success: true,
      linkToken: response.data.link_token,
    }
  } catch (error) {
    console.error('Plaid link token error:', error)
    return {
      success: false,
      error: 'Failed to create bank connection token',
    }
  }
}

// Exchange Plaid public token for access token
export async function exchangePlaidToken(publicToken: string) {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      client_id: process.env.PLAID_CLIENT_ID!,
      secret: process.env.PLAID_SECRET!,
      public_token: publicToken,
    })

    return {
      success: true,
      accessToken: response.data.access_token,
      itemId: response.data.item_id,
    }
  } catch (error) {
    console.error('Plaid token exchange error:', error)
    return {
      success: false,
      error: 'Failed to verify bank account',
    }
  }
}

// Get bank account details from Plaid
export async function getPlaidAccountDetails(accessToken: string) {
  try {
    const authResponse = await plaidClient.authGet({
      client_id: process.env.PLAID_CLIENT_ID!,
      secret: process.env.PLAID_SECRET!,
      access_token: accessToken,
    })

    const accounts = authResponse.data.accounts
    const numbers = authResponse.data.numbers.ach

    return {
      success: true,
      accounts: accounts.map((account, index) => ({
        id: account.account_id,
        name: account.name,
        type: account.subtype,
        mask: account.mask,
        accountNumber: numbers?.[index]?.account || '',
        routingNumber: numbers?.[index]?.routing || '',
      })),
    }
  } catch (error) {
    console.error('Plaid account details error:', error)
    return {
      success: false,
      error: 'Failed to retrieve account details',
    }
  }
}

// Create Dwolla customer
export async function createDwollaCustomer(userData: {
  firstName: string
  lastName: string
  email: string
  type: 'personal' | 'business'
  address1: string
  city: string
  state: string
  postalCode: string
  dateOfBirth?: string
  ssn?: string
}) {
  try {
    const appToken = await dwollaClient.auth.client()
    
    const customer = await appToken.post('customers', {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      type: userData.type,
      address1: userData.address1,
      city: userData.city,
      state: userData.state,
      postalCode: userData.postalCode,
      dateOfBirth: userData.dateOfBirth,
      ssn: userData.ssn,
    })

    return {
      success: true,
      customerId: customer.headers.get('location'),
    }
  } catch (error) {
    console.error('Dwolla customer creation error:', error)
    return {
      success: false,
      error: 'Failed to create payment account',
    }
  }
}

// Create Dwolla funding source (bank account)
export async function createDwollaFundingSource(
  customerId: string,
  accountDetails: {
    routingNumber: string
    accountNumber: string
    accountType: 'checking' | 'savings'
    name: string
  }
) {
  try {
    const appToken = await dwollaClient.auth.client()
    
    const fundingSource = await appToken.post(
      `${customerId}/funding-sources`,
      {
        routingNumber: accountDetails.routingNumber,
        accountNumber: accountDetails.accountNumber,
        bankAccountType: accountDetails.accountType,
        name: accountDetails.name,
      }
    )

    return {
      success: true,
      fundingSourceId: fundingSource.headers.get('location'),
    }
  } catch (error) {
    console.error('Dwolla funding source error:', error)
    return {
      success: false,
      error: 'Failed to add bank account',
    }
  }
}

// Initiate ACH transfer via Dwolla
export async function initiateACHTransfer(
  sourceFundingUrl: string,
  destinationFundingUrl: string,
  amount: number,
  metadata?: Record<string, any>
) {
  try {
    const appToken = await dwollaClient.auth.client()
    
    const transfer = await appToken.post('transfers', {
      _links: {
        source: { href: sourceFundingUrl },
        destination: { href: destinationFundingUrl },
      },
      amount: {
        currency: 'USD',
        value: amount.toFixed(2),
      },
      metadata,
    })

    return {
      success: true,
      transferId: transfer.headers.get('location'),
    }
  } catch (error) {
    console.error('Dwolla transfer error:', error)
    return {
      success: false,
      error: 'Failed to initiate transfer',
    }
  }
}

// Get transfer status
export async function getACHTransferStatus(transferUrl: string) {
  try {
    const appToken = await dwollaClient.auth.client()
    const transfer = await appToken.get(transferUrl)

    return {
      success: true,
      status: transfer.body.status,
      created: transfer.body.created,
      amount: transfer.body.amount,
    }
  } catch (error) {
    console.error('Dwolla transfer status error:', error)
    return {
      success: false,
      error: 'Failed to get transfer status',
    }
  }
}