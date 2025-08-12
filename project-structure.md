# Project Structure - Influencer Management Platform

## Directory Structure Overview

```
influencer-platform/
├── app/                        # Next.js app directory
│   ├── (auth)/                # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (public)/              # Public pages
│   │   ├── page.tsx          # Landing page
│   │   ├── campaigns/        # Browse campaigns
│   │   └── how-it-works/
│   ├── influencer/            # Influencer dashboard
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── submissions/
│   │   ├── earnings/
│   │   └── profile/
│   ├── brand/                 # Brand dashboard
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── applications/
│   │   ├── content/
│   │   ├── analytics/
│   │   └── payments/
│   ├── api/                   # API routes
│   │   ├── auth/
│   │   ├── campaigns/
│   │   ├── submissions/
│   │   ├── payments/
│   │   └── webhooks/
│   ├── layout.tsx             # Root layout
│   └── globals.css            # Global styles
│
├── components/                 # Shared components
│   ├── ui/                   # UI components
│   ├── campaigns/             # Campaign components
│   ├── influencer/           # Influencer components
│   ├── brand/                # Brand components
│   └── shared/               # Shared components
│
├── lib/                       # Library code
│   ├── supabase/             # Supabase client
│   ├── actions/              # Server actions
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utility functions
│   └── types/                # TypeScript types
│
├── public/                    # Static assets
├── .env.local                # Environment variables
├── next.config.js            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS config
├── package.json
└── tsconfig.json             # TypeScript config
```

## Next.js App Directory Structure

### `/app/(auth)/`
```
(auth)/
├── layout.tsx              # Auth layout wrapper
├── login/
│   └── page.tsx           # Login page
├── register/
│   └── page.tsx           # Registration with role selection
└── reset-password/
    └── page.tsx           # Password reset
```

### `/app/influencer/`
```
influencer/
├── layout.tsx              # Influencer layout with sidebar
├── dashboard/
│   └── page.tsx           # Dashboard overview
├── campaigns/
│   ├── page.tsx           # Browse campaigns
│   └── [id]/
│       └── page.tsx       # Campaign details & apply
├── submissions/
│   ├── page.tsx           # My submissions
│   └── [campaignId]/
│       └── submit/
│           └── page.tsx   # Submit content
├── earnings/
│   └── page.tsx           # Earnings & payouts
└── profile/
    └── page.tsx           # Profile management
```

### `/app/brand/`
```
brand/
├── layout.tsx              # Brand layout with sidebar
├── dashboard/
│   └── page.tsx           # Brand dashboard
├── campaigns/
│   ├── page.tsx           # Manage campaigns
│   ├── new/
│   │   └── page.tsx       # Create campaign
│   └── [id]/
│       ├── page.tsx       # Campaign details
│       └── edit/
│           └── page.tsx   # Edit campaign
├── applications/
│   └── page.tsx           # Review applications
├── content/
│   └── page.tsx           # Content moderation
├── analytics/
│   └── page.tsx           # Campaign analytics
└── payments/
    └── page.tsx           # Payment management
```

### `/app/api/` - API Routes
```
api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── logout/route.ts
│   └── refresh/route.ts
├── campaigns/
│   ├── route.ts           # GET all, POST new
│   └── [id]/
│       ├── route.ts       # GET, PUT, DELETE
│       └── apply/route.ts # POST application
├── submissions/
│   ├── route.ts           # GET all, POST new
│   └── [id]/
│       └── route.ts       # GET, PUT status
├── payments/
│   ├── payout/route.ts    # Request payout
│   ├── history/route.ts   # Payment history
│   └── balance/route.ts   # Current balance
└── webhooks/
    ├── stripe/route.ts    # Stripe webhooks
    └── paypal/route.ts    # PayPal webhooks
```

## Components Structure

### `/components/ui/`
```
ui/
├── button.tsx
├── input.tsx
├── select.tsx
├── modal.tsx
├── card.tsx
├── table.tsx
├── tabs.tsx
├── toast.tsx
├── dropdown.tsx
├── skeleton.tsx
└── dialog.tsx
```

### `/components/campaigns/`
```
campaigns/
├── campaign-card.tsx
├── campaign-list.tsx
├── campaign-filter.tsx
├── campaign-form.tsx
├── campaign-requirements.tsx
└── campaign-metrics.tsx
```

### `/components/shared/`
```
shared/
├── header.tsx
├── footer.tsx
├── sidebar.tsx
├── notification-bell.tsx
├── user-avatar.tsx
├── stats-card.tsx
├── loading-spinner.tsx
└── error-boundary.tsx
```

## Lib Structure

### `/lib/supabase/`
```
supabase/
├── client.ts              # Supabase client setup
├── server.ts              # Server-side client
├── middleware.ts          # Auth middleware using Supabase Auth
├── types.ts               # Database types from Supabase
├── realtime.ts            # Realtime subscriptions setup
├── storage.ts             # Supabase Storage for files
└── queries/               # Database queries
    ├── users.ts
    ├── campaigns.ts
    ├── submissions.ts
    ├── payments.ts
    ├── notifications.ts   # Notification queries
    └── analytics.ts       # Analytics views
```

### `/lib/actions/`
```
actions/
├── auth.actions.ts        # Supabase Auth actions
├── campaign.actions.ts    # Campaign CRUD via Supabase
├── submission.actions.ts  # Content submission to Supabase
├── payment.actions.ts     # Payment processing (external + Supabase logs)
├── analytics.actions.ts   # Analytics from Supabase views
├── notification.actions.ts # Supabase realtime notifications
└── storage.actions.ts     # Supabase Storage operations
```

### `/lib/hooks/`
```
hooks/
├── use-auth.ts           # Supabase Auth hook
├── use-campaigns.ts      # Campaigns data from Supabase
├── use-supabase.ts      # Supabase client hook
├── use-realtime.ts      # Supabase Realtime subscriptions
├── use-notifications.ts # Supabase realtime notifications
├── use-storage.ts       # Supabase Storage hook
├── use-toast.ts         # Toast notifications
└── use-debounce.ts      # Debounce hook
```

### `/lib/utils/`
```
utils/
├── validators.ts         # Input validation
├── formatters.ts        # Data formatting
├── constants.ts         # App constants
├── helpers.ts           # Helper functions
├── crypto.ts            # Crypto utilities
└── url-parser.ts        # Social media URL parsing
```

## Supabase Database Schema

### Database Tables
```sql
-- Users table (handled by Supabase Auth)
-- Additional user data in profiles

-- Influencer profiles
CREATE TABLE influencer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_handle TEXT,
  instagram_followers INTEGER DEFAULT 0,
  instagram_engagement DECIMAL(5,2) DEFAULT 0,
  tiktok_handle TEXT,
  tiktok_followers INTEGER DEFAULT 0,
  tiktok_engagement DECIMAL(5,2) DEFAULT 0,
  niche TEXT[],
  bio TEXT,
  reputation_score DECIMAL(3,2) DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  paypal_email TEXT,
  stripe_customer_id TEXT,
  stripe_account_id TEXT, -- For ACH payouts
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  platforms TEXT[] CHECK (platforms <@ ARRAY['instagram', 'tiktok']),
  budget DECIMAL(10,2),
  slots_available INTEGER,
  min_ig_followers INTEGER,
  min_tiktok_followers INTEGER,
  min_engagement_rate DECIMAL(5,2),
  niche TEXT[],
  hashtags TEXT[],
  mentions TEXT[],
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign applications
CREATE TABLE campaign_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES auth.users(id),
  proposed_rate DECIMAL(10,2),
  cover_letter TEXT,
  status TEXT DEFAULT 'pending',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  influencer_id UUID REFERENCES auth.users(id),
  platform TEXT CHECK (platform IN ('instagram', 'tiktok')),
  post_url TEXT NOT NULL,
  caption TEXT,
  posted_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  review_notes TEXT,
  engagement_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id),
  influencer_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2),
  payment_method TEXT CHECK (payment_method IN ('ach', 'paypal')),
  payment_details JSONB,
  status TEXT DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  paypal_transaction_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
```

## Environment Variables

### `.env.local`
```env
# Supabase (Primary Backend Service)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Social Media APIs (Only for verification)
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret

# Payment Processing (External requirement)
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# Note: Crypto payments deferred to Phase 2 (not in MVP)
```

## Package Dependencies

### `package.json`
```json
{
  "name": "influencer-platform",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "db:migrate": "supabase migration up",
    "db:reset": "supabase db reset"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.8.7",
    "@supabase/auth-helpers-react": "^0.4.2",
    "@supabase/realtime-js": "^2.9.0",
    "stripe": "^14.10.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "@tanstack/react-query": "^5.14.0",
    "@hookform/resolvers": "^3.3.2",
    "react-hook-form": "^7.48.2",
    "zod": "^3.22.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "recharts": "^2.10.3",
    "date-fns": "^3.0.6",
    "react-hot-toast": "^2.4.1",
    "resend": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "@types/react-dom": "^18.2.18",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4",
    "prettier": "^3.1.1",
    "@supabase/cli": "^1.123.0"
  }
}
```

## Supabase Configuration

### `supabase/config.toml`
```toml
# Supabase project configuration
[project]
id = "your-project-id"

[api]
enabled = true
port = 54321
schemas = ["public", "storage"]

[db]
port = 54322
major_version = 15

[studio]
enabled = true
port = 54323

[auth]
enable_signup = true
enable_login = true

[auth.email]
enable_signup = true
enable_login = true

[storage]
enabled = true
```

### Edge Functions Structure
```
supabase/functions/
├── process-payout/
│   └── index.ts          # Process ACH/PayPal payouts
├── verify-instagram/
│   └── index.ts          # Verify Instagram account
├── verify-tiktok/
│   └── index.ts          # Verify TikTok account
├── calculate-metrics/
│   └── index.ts          # Calculate campaign metrics
├── send-email/
│   └── index.ts          # Send transactional emails
├── stripe-webhook/
│   └── index.ts          # Handle Stripe webhooks
├── paypal-webhook/
│   └── index.ts          # Handle PayPal webhooks
└── scheduled-tasks/
    └── index.ts          # Cron jobs for metrics updates
```

## Deployment Configuration

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'instagram.com',
      'tiktok.com',
      'your-supabase-url.supabase.co'
    ],
  },
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

module.exports = nextConfig
```

### `vercel.json` (for Vercel deployment)
```json
{
  "functions": {
    "app/api/webhooks/stripe/route.ts": {
      "maxDuration": 30
    },
    "app/api/payments/payout/route.ts": {
      "maxDuration": 60
    }
  },
  "crons": [
    {
      "path": "/api/cron/process-payouts",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/update-metrics",
      "schedule": "0 */1 * * *"
    }
  ]
}
```

## Testing Structure

### Testing Folders
```
__tests__/
├── unit/
│   ├── lib/
│   ├── components/
│   └── utils/
├── integration/
│   ├── auth.test.ts
│   ├── campaigns.test.ts
│   └── payments.test.ts
└── e2e/
    ├── influencer-flow.test.ts
    └── brand-flow.test.ts
```

## Development Scripts

### Common Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx supabase start      # Start local Supabase
npx supabase db push    # Push schema changes
npx supabase db reset   # Reset database

# Type checking
npm run type-check      # Check TypeScript types
npm run lint           # Run ESLint
npm run format         # Format with Prettier

# Testing
npm test               # Run tests
npm run test:e2e       # Run E2E tests
```

## Project Features Map

### Core Features Location
- **Authentication**: `/app/(auth)/`, `/lib/supabase/middleware.ts`
- **Campaigns**: `/app/brand/campaigns/`, `/app/api/campaigns/`
- **Submissions**: `/app/influencer/submissions/`, `/app/api/submissions/`
- **Payments**: `/app/api/payments/`, `/lib/actions/payment.actions.ts`
- **Analytics**: `/app/brand/analytics/`, `/lib/actions/analytics.actions.ts`

### Payment Integration
- **Stripe ACH**: Server actions with Stripe SDK
- **PayPal**: Edge functions for PayPal processing
- **Transaction Records**: Stored in Supabase database

## Security Implementation

### Middleware (`middleware.ts`)
```typescript
// Protected routes configuration
export const config = {
  matcher: [
    '/influencer/:path*',
    '/brand/:path*',
    '/api/campaigns/:path*',
    '/api/submissions/:path*',
    '/api/payments/:path*'
  ]
}
```

## Ready to Start Development

1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Run database migrations
6. Start development server: `npm run dev`

This structure provides a production-ready Next.js + Supabase application with full TypeScript support, server-side rendering, and real-time capabilities.