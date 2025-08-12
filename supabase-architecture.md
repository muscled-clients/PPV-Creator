# Supabase-First Architecture

## Overview
This document outlines how we maximize Supabase's capabilities to minimize external dependencies and create a cohesive, efficient architecture for the Influencer Management Platform.

## Core Principle
**Use Supabase for everything it can handle efficiently, only use external services when absolutely necessary.**

## Supabase Services Utilization

### 1. Authentication (Supabase Auth)
**Replaces:** NextAuth, Auth0, Firebase Auth, Custom JWT implementation

**Implementation:**
- User registration and login
- Role-based access control (RBAC)
- OAuth providers (if needed)
- Email verification
- Password reset
- Session management
- Multi-factor authentication (MFA)

**Benefits:**
- Zero configuration JWT handling
- Built-in email templates
- Automatic session refresh
- Secure by default

### 2. Database (Supabase PostgreSQL)
**Replaces:** MongoDB, MySQL, Redis (for most caching needs)

**Implementation:**
- All application data storage
- Complex queries with PostgreSQL power
- Database views for analytics
- Stored procedures for business logic
- Triggers for automated workflows
- Full-text search capabilities

**Features Used:**
```sql
-- Row Level Security for data protection
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Database Views for Analytics
CREATE VIEW campaign_analytics AS
SELECT 
  c.id,
  c.title,
  COUNT(s.id) as total_submissions,
  SUM(t.amount) as total_spent
FROM campaigns c
LEFT JOIN submissions s ON c.id = s.campaign_id
LEFT JOIN transactions t ON c.id = t.campaign_id
GROUP BY c.id;

-- Triggers for automated notifications
CREATE TRIGGER new_submission_notification
AFTER INSERT ON submissions
FOR EACH ROW
EXECUTE FUNCTION notify_brand_of_submission();
```

### 3. Realtime (Supabase Realtime)
**Replaces:** Socket.io, Pusher, Firebase Realtime Database

**Implementation:**
- Live campaign updates
- In-app notifications
- Real-time submission status
- Live analytics dashboard
- Presence (who's online)
- Broadcast messages

**Code Example:**
```typescript
// Subscribe to campaign updates
const subscription = supabase
  .channel('campaigns')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'campaigns' },
    (payload) => {
      // Handle real-time updates
      updateCampaignList(payload.new)
    }
  )
  .subscribe()
```

### 4. Storage (Supabase Storage)
**Replaces:** AWS S3, Cloudinary, Firebase Storage

**Implementation:**
- Profile pictures
- Campaign assets
- Submission proof screenshots
- Document storage
- Public CDN for assets

**Benefits:**
- Integrated with RLS
- Direct browser uploads
- Automatic image optimization
- CDN included

### 5. Edge Functions (Supabase Functions)
**Replaces:** AWS Lambda, Vercel Functions, Netlify Functions

**Implementation:**
```typescript
// supabase/functions/send-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  // Email logic using Supabase data
  const { data: notification } = await supabase
    .from('notifications')
    .select('*')
    .eq('sent', false)
    .single()
    
  // Send email via Resend or SMTP
  // Update notification status in Supabase
})
```

**Use Cases:**
- Email notifications
- Payment webhook processing
- Social media verification
- Scheduled tasks (cron jobs)
- Complex calculations
- Third-party API calls

### 6. Vector Embeddings (Supabase Vector)
**Replaces:** Pinecone, Weaviate, Custom ML infrastructure

**Future Implementation:**
- Campaign recommendation engine
- Similar influencer matching
- Content similarity detection

## Next.js Integration Points

### 1. Server Components with Supabase
```typescript
// app/campaigns/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function CampaignsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: campaigns } = await supabase
    .from('campaigns')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
  
  return <CampaignList campaigns={campaigns} />
}
```

### 2. Server Actions with Supabase
```typescript
// app/actions/campaign.ts
'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function createCampaign(formData: FormData) {
  const supabase = createServerActionClient({ cookies })
  
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      title: formData.get('title'),
      description: formData.get('description'),
      // ... other fields
    })
    .select()
    .single()
    
  if (error) throw error
  return data
}
```

### 3. Middleware for Auth
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: Request) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  return res
}
```

## External Services (Only When Necessary)

### 1. Payment Processing
**Why External:** Regulatory compliance, specialized infrastructure

**Services:**
- Stripe (ACH payments)
- PayPal (Instant payouts)
- Ethers.js (Crypto/USDC)

**Integration:**
- Process payments externally
- Store transaction records in Supabase
- Use Edge Functions for webhooks

### 2. Social Media Verification
**Why External:** Platform-specific APIs required

**Services:**
- Instagram Basic Display API
- TikTok for Developers API

**Integration:**
- Verify accounts via API
- Cache results in Supabase
- Update via Edge Functions

### 3. Email Delivery (Optional)
**Why Consider External:** High-volume sending, deliverability

**Services:**
- Resend (simpler than SendGrid)
- SMTP with Supabase Edge Functions

**Note:** For basic emails, Supabase Auth handles verification and password reset emails automatically.

## Database Schema Optimizations

### 1. Materialized Views for Performance
```sql
CREATE MATERIALIZED VIEW influencer_stats AS
SELECT 
  i.user_id,
  COUNT(DISTINCT s.campaign_id) as total_campaigns,
  AVG(t.amount) as avg_earnings,
  SUM(t.amount) as total_earnings
FROM influencer_profiles i
LEFT JOIN submissions s ON i.user_id = s.influencer_id
LEFT JOIN transactions t ON t.influencer_id = i.user_id
GROUP BY i.user_id;

-- Refresh periodically
CREATE OR REPLACE FUNCTION refresh_influencer_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW influencer_stats;
END;
$$ LANGUAGE plpgsql;
```

### 2. RLS Policies for Security
```sql
-- Influencers can only see their own submissions
CREATE POLICY "Users can view own submissions" ON submissions
  FOR SELECT USING (auth.uid() = influencer_id);

-- Brands can see submissions for their campaigns
CREATE POLICY "Brands can view campaign submissions" ON submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = submissions.campaign_id 
      AND campaigns.brand_id = auth.uid()
    )
  );
```

### 3. Database Functions for Business Logic
```sql
-- Calculate influencer reputation score
CREATE OR REPLACE FUNCTION calculate_reputation_score(influencer_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL;
BEGIN
  SELECT 
    (completion_rate * 0.4) +
    (avg_rating * 0.3) +
    (response_time_score * 0.2) +
    (engagement_score * 0.1)
  INTO score
  FROM (
    -- Complex calculation logic here
  ) AS metrics;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
```

## Performance Optimizations

### 1. Connection Pooling
- Use Supabase connection pooler for serverless
- PgBouncer included in Supabase

### 2. Caching Strategy
- Use Supabase's built-in caching
- Database query caching
- CDN for static assets via Supabase Storage

### 3. Real-time Optimization
- Subscribe only to necessary channels
- Use filters to reduce data transfer
- Implement presence carefully

## Development Workflow

### 1. Local Development
```bash
# Start Supabase locally
supabase start

# Run migrations
supabase migration up

# Generate types
supabase gen types typescript --local > lib/database.types.ts

# Start Next.js
npm run dev
```

### 2. Environment Variables (Minimal)
```env
# Only need Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Payment services (external requirement)
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=

# Social media (external requirement)
INSTAGRAM_CLIENT_ID=
TIKTOK_CLIENT_KEY=
```

## Cost Optimization

### Supabase Free Tier Limits
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

### When to Upgrade
- Database > 500MB: $25/month
- Need Point-in-time recovery
- More file storage needed
- Custom domain for auth emails

### Cost Comparison
**Traditional Stack:**
- Database: $50-200/month
- Auth service: $50-100/month
- File storage: $20-50/month
- Realtime service: $50-100/month
- Total: $170-450/month

**Supabase Stack:**
- Everything included: $25-200/month
- Significant cost savings

## Security Best Practices

### 1. Always Use RLS
```sql
-- Enable on every table
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### 2. Service Role Key Security
- Never expose in client code
- Use only in Edge Functions
- Rotate regularly

### 3. Environment Variables
- Use Vercel/Next.js env management
- Different keys for dev/staging/prod

## Migration Path

### Phase 1: Core Setup
1. Set up Supabase project
2. Configure authentication
3. Create database schema
4. Implement RLS policies

### Phase 2: Feature Implementation
1. User management with Supabase Auth
2. Campaign CRUD with database
3. Real-time notifications
4. File uploads with Storage

### Phase 3: Advanced Features
1. Edge Functions for complex logic
2. Scheduled tasks
3. Analytics views
4. Performance optimization

## Monitoring & Observability

### Built-in Supabase Monitoring
- Database metrics
- API usage
- Auth events
- Storage bandwidth

### Additional Monitoring
- Vercel Analytics for Next.js
- PostHog for user behavior (optional)
- Supabase logs for debugging

## Conclusion

By adopting a Supabase-first architecture:
- **Reduced complexity:** One service handles most backend needs
- **Lower costs:** Consolidated billing, better free tier
- **Faster development:** Built-in features reduce custom code
- **Better performance:** Optimized for Next.js integration
- **Enhanced security:** RLS and auth built-in
- **Real-time by default:** No additional setup needed

This architecture provides a solid foundation that can scale from MVP to production with minimal changes to the core infrastructure.