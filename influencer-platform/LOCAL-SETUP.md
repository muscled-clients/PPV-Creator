# Local Development Setup Guide

## Prerequisites

Before setting up the local environment, ensure you have:

### Required Software
- **Node.js** (v18 or later) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets

### Required Accounts & Services
You'll need accounts for the following services:

1. **Supabase** (Database & Auth) - [supabase.com](https://supabase.com)
2. **Plaid** (ACH Bank Verification) - [plaid.com](https://plaid.com)
3. **Dwolla** (ACH Transfers) - [dwolla.com](https://dwolla.com)
4. **PayPal Developer** (PayPal Payouts) - [developer.paypal.com](https://developer.paypal.com)
5. **Coinbase Commerce** (Crypto Payments) - [commerce.coinbase.com](https://commerce.coinbase.com)

## Environment Variables Setup

### 1. Create Environment Files

```bash
# In your project root directory
cp .env.example .env.local
```

### 2. Required Environment Variables

Here's what you need to configure in your `.env.local` file:

```env
# =================================
# NEXTJS CONFIGURATION
# =================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =================================
# SUPABASE CONFIGURATION
# =================================
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# =================================
# ACH PAYMENTS (Plaid + Dwolla)
# =================================
# Plaid Configuration
PLAID_CLIENT_ID=your-plaid-client-id
PLAID_SECRET=your-plaid-secret-key
PLAID_ENV=sandbox
PLAID_WEBHOOK_URL=http://localhost:3000/api/webhooks/plaid

# Dwolla Configuration
DWOLLA_KEY=your-dwolla-key
DWOLLA_SECRET=your-dwolla-secret
DWOLLA_ENV=sandbox
DWOLLA_MASTER_FUNDING_SOURCE=your-dwolla-master-funding-source-url

# =================================
# PAYPAL CONFIGURATION
# =================================
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_ENV=sandbox

# =================================
# CRYPTO PAYMENTS (Coinbase Commerce)
# =================================
COINBASE_COMMERCE_API_KEY=your-coinbase-commerce-api-key
COINBASE_COMMERCE_WEBHOOK_SECRET=your-coinbase-webhook-secret

# =================================
# SOCIAL MEDIA APIs (Optional)
# =================================
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# =================================
# EMAIL CONFIGURATION (Optional)
# =================================
RESEND_API_KEY=your-resend-api-key
# OR
SENDGRID_API_KEY=your-sendgrid-api-key

# =================================
# WEBHOOK SECRETS
# =================================
WEBHOOK_SECRET=your-webhook-secret-for-verification
```

## Step-by-Step Service Setup

### 1. Supabase Setup (Database & Auth)

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Choose a region close to you
4. Set a database password (save this!)

#### Get Supabase Credentials
```bash
# From your Supabase dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon/public key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)
```

#### Set Up Database Schema
```bash
# Run our migration files in Supabase SQL Editor
# Copy and paste each file from /supabase/migrations/
```

### 2. Plaid Setup (Bank Account Verification)

#### Create Plaid Account
1. Go to [plaid.com](https://plaid.com) and sign up
2. Create a new application
3. Select "Auth" and "Transactions" products
4. Environment: Sandbox (for development)

#### Get Plaid Credentials
```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_sandbox_secret
PLAID_ENV=sandbox
```

### 3. Dwolla Setup (ACH Transfers)

#### Create Dwolla Account
1. Go to [dwolla.com](https://dwolla.com) and create a sandbox account
2. Navigate to Applications > Create Application
3. Select "ACH API" product

#### Get Dwolla Credentials
```bash
DWOLLA_KEY=your_app_key
DWOLLA_SECRET=your_app_secret
DWOLLA_ENV=sandbox
```

### 4. PayPal Setup (Instant Payouts)

#### Create PayPal Developer Account
1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Create a new application
3. Select "Payouts" capability

#### Get PayPal Credentials
```bash
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENV=sandbox
```

### 5. Coinbase Commerce Setup (Crypto Payments)

#### Create Coinbase Commerce Account
1. Go to [commerce.coinbase.com](https://commerce.coinbase.com)
2. Create a new account
3. Generate API key in Settings

#### Get Coinbase Credentials
```bash
COINBASE_COMMERCE_API_KEY=your_api_key
COINBASE_COMMERCE_WEBHOOK_SECRET=your_webhook_secret
```

## Installation & Setup

### 1. Install Dependencies
```bash
cd "E:\influencer management\influencer-platform"
npm install
```

### 2. Set Up Environment Variables
```bash
# Create your .env.local file with the variables above
# Make sure to replace all placeholder values with real credentials
```

### 3. Set Up Database
```bash
# In Supabase SQL Editor, run each migration file:
# 1. Copy content from supabase/migrations/001_initial_schema.sql
# 2. Run in SQL Editor
# 3. Copy content from supabase/migrations/002_row_level_security.sql
# 4. Run in SQL Editor
# 5. Copy content from supabase/migrations/003_database_functions.sql
# 6. Run in SQL Editor
```

### 4. Test Configuration
```bash
# Run tests to ensure everything is configured correctly
npm test
```

### 5. Start Development Server
```bash
npm run dev
```

Your application will be available at `http://localhost:3000`

## Testing Your Setup

### 1. Test Authentication
- Go to `/auth/register`
- Create a test influencer account
- Create a test brand account
- Verify email confirmation works

### 2. Test Core Features
- **Campaigns**: Create a campaign (brand account)
- **Applications**: Apply to campaign (influencer account)
- **Submissions**: Submit content (after approval)
- **Payments**: Add payment methods (test mode)

### 3. Test Payment Integration
- **ACH**: Use Plaid's test bank accounts
- **PayPal**: Use PayPal sandbox accounts
- **Crypto**: Use Coinbase Commerce test mode

## Sandbox/Test Credentials

### Plaid Test Bank Account
```
Institution: First Platypus Bank
Username: user_good
Password: pass_good
```

### PayPal Sandbox Accounts
```
# You'll get test accounts in your PayPal Developer dashboard
# Use these for testing payouts
```

### Dwolla Sandbox
```
# Create test customers and funding sources in Dwolla sandbox
# No real money is moved in sandbox mode
```

## Security Best Practices

### 1. Environment Variables
- ✅ Never commit `.env.local` to git
- ✅ Use different credentials for development/production
- ✅ Rotate keys regularly
- ✅ Use strong, unique webhook secrets

### 2. Local Development Security
```bash
# Add to .gitignore (already included)
.env.local
.env*.local
*.log
```

### 3. Network Security
- Only use HTTPS in production
- Use localhost/127.0.0.1 for local development
- Set up proper CORS policies

## Troubleshooting Common Issues

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
npm run dev -- -p 3001
```

### Supabase Connection Issues
- Verify your project URL and keys
- Check if your IP is allowed (if using IP restrictions)
- Ensure RLS policies are set up correctly

### Payment Integration Issues
- Verify all API keys are correct
- Check if you're using sandbox/test mode
- Ensure webhook URLs are reachable

### Database Issues
```bash
# Reset Supabase database if needed
# Go to Supabase Dashboard > Settings > Database
# Click "Reset Database" (only in development!)
```

## Next Steps

Once your local environment is working:

1. ✅ Test all core features
2. ✅ Verify payment flows work
3. ✅ Check analytics dashboard
4. ✅ Test user roles and permissions
5. ✅ Run full test suite: `npm test`

You'll be ready for production deployment once everything works locally!

## Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify all environment variables are set
4. Ensure all services are in test/sandbox mode
5. Run `npm test` to verify setup