# TikTok Integration Setup Guide

This guide walks you through setting up real TikTok data integration for your influencer platform.

## 🎯 Overview

The TikTok integration allows you to:
- Fetch real view counts from TikTok videos
- Track engagement metrics (likes, comments, shares)
- Automatically sync data periodically
- Display real performance data in campaigns

## 📋 Prerequisites

1. **TikTok Developer Account** - [Register here](https://developers.tiktok.com/)
2. **Running Next.js Application**
3. **Supabase Database Access**

## 🔧 Step 1: TikTok API Setup

### Create TikTok App

1. Go to [TikTok Developers](https://developers.tiktok.com/)
2. Click "Manage Apps" → "Create an App"
3. Fill out the application form:
   - **App Name**: Your platform name
   - **App Type**: Web Application
   - **App URL**: Your platform URL
   - **Description**: Brief description of your influencer platform

### Get API Credentials

1. After app approval, go to your app dashboard
2. Navigate to "Basic Information"
3. Copy your:
   - **Client Key** (similar to API key)
   - **Client Secret**

### Request API Access

For view counts, you need either:

#### Option A: Research API (Recommended for analytics)
- Provides detailed metrics including view counts
- Requires special approval from TikTok
- Submit request explaining your use case
- Usually takes 1-2 weeks for approval

#### Option B: Marketing API (For verified businesses)
- Requires business verification
- Provides comprehensive analytics
- More complex setup process

#### Option C: Oembed API (Basic, no approval needed)
- Public API, no authentication required
- Provides basic video info but NO view counts
- Good for testing and basic metadata

## 🔧 Step 2: Environment Configuration

Add these variables to your `.env.local` file:

```env
# TikTok API Configuration
TIKTOK_CLIENT_KEY=your_client_key_here
TIKTOK_CLIENT_SECRET=your_client_secret_here
TIKTOK_API_BASE_URL=https://open-api.tiktok.com
TIKTOK_RESEARCH_API_ENABLED=false  # Set to true when you get Research API access

# Optional: Webhook configuration for real-time updates
TIKTOK_WEBHOOK_SECRET=your_webhook_secret_here
```

## 🗄️ Step 3: Database Migration

Run the database migration to add TikTok metadata support:

```bash
# Apply the migration
cd "E:\influencer management\influencer-platform"
# Copy the migration file to your Supabase project and run it
```

Or manually run the SQL from `supabase/migrations/20250122_add_tiktok_metadata.sql`

## 🧪 Step 4: Test the Integration

Run the test script to verify everything is working:

```bash
node scripts/test-tiktok-integration.js
```

This will check:
- ✅ Environment variables
- ✅ Database connection
- ✅ URL validation
- ✅ API connectivity
- ✅ Endpoint functionality

## 🚀 Step 5: API Endpoints Usage

### Fetch Single Video Data

```bash
GET /api/tiktok/video?url=https://www.tiktok.com/@username/video/1234567890
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "1234567890",
    "view_count": 50000,
    "like_count": 1200,
    "comment_count": 89,
    "share_count": 45,
    "title": "Amazing video!",
    "author": "username"
  }
}
```

### Batch Sync Views

```bash
POST /api/tiktok/sync-views
Content-Type: application/json

{
  "application_id": "optional-app-id",
  "force_refresh": false
}
```

### Get Sync Status

```bash
GET /api/tiktok/sync-views
```

## ⚙️ Step 6: Automated Sync Setup

### Option A: Vercel Cron Jobs (Recommended for Vercel deployment)

Create `vercel.json` with cron configuration:

```json
{
  "crons": [
    {
      "path": "/api/tiktok/sync-views",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Option B: GitHub Actions (For any deployment)

Create `.github/workflows/sync-tiktok.yml`:

```yaml
name: Sync TikTok Data
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Sync TikTok Views
        run: |
          curl -X POST "${{ secrets.APP_URL }}/api/tiktok/sync-views" \
            -H "Content-Type: application/json" \
            -d '{}'
```

### Option C: External Cron Service

Use services like:
- **Cron-job.org** (free)
- **UptimeRobot** (with webhooks)
- **AWS CloudWatch Events**

## 📊 Step 7: Integration with Existing Features

The integration automatically works with:

### View Tracking Service
```typescript
// lib/services/view-tracking-service.ts
// Now fetches real TikTok data when available
```

### Application Showcase
```typescript
// components/applications/approved-applications-showcase.tsx
// Displays real view counts for approved TikTok content
```

### Campaign Analytics
```sql
-- Use the new tiktok_analytics view
SELECT * FROM tiktok_analytics 
WHERE campaign_id = 'your-campaign-id';
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "TikTok API not configured" Error
- Check `.env.local` has `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET`
- Restart your development server after adding env vars

#### 2. "Failed to get access token" Error
- Verify your Client Key and Client Secret are correct
- Check if your TikTok app is approved and active
- Ensure your app has the correct permissions

#### 3. "Video not found" Error
- TikTok video might be private or deleted
- URL format might be incorrect
- Video might not be accessible via API

#### 4. Rate Limiting Issues
- TikTok has strict rate limits (varies by API tier)
- Implement exponential backoff
- Consider caching results

### Debug Steps

1. **Check Environment**:
   ```bash
   node scripts/test-tiktok-integration.js
   ```

2. **Test Single URL**:
   ```bash
   curl "http://localhost:3000/api/tiktok/video?url=https://www.tiktok.com/@markangelcomedy/video/7299127405040422149"
   ```

3. **Check Database**:
   ```sql
   SELECT * FROM application_content_links 
   WHERE platform = 'tiktok' 
   ORDER BY updated_at DESC 
   LIMIT 5;
   ```

## 📈 Monitoring & Analytics

### View Sync Status
```sql
-- Check sync health
SELECT 
  sync_status,
  COUNT(*) as count,
  AVG(views_tracked) as avg_views
FROM application_content_links 
WHERE platform = 'tiktok' 
GROUP BY sync_status;
```

### Performance Metrics
```sql
-- Top performing TikTok content
SELECT 
  campaign_title,
  influencer_name,
  content_url,
  views_tracked,
  like_count,
  comment_count
FROM tiktok_analytics 
ORDER BY views_tracked DESC 
LIMIT 10;
```

## 🔒 Security Considerations

1. **Never expose API secrets** in client-side code
2. **Use environment variables** for all credentials
3. **Implement rate limiting** on your endpoints
4. **Validate all URLs** before processing
5. **Sanitize data** from external APIs

## 🆙 Scaling Considerations

### For High Volume
1. **Background job queue** (Redis/Bull)
2. **Database indexing** on frequently queried fields
3. **API response caching** (reduce external calls)
4. **Batch processing** for large datasets

### Production Optimizations
```typescript
// Add to production environment
TIKTOK_BATCH_SIZE=50
TIKTOK_SYNC_INTERVAL=3600  // 1 hour in seconds
TIKTOK_CACHE_TTL=1800      // 30 minutes
```

## 📚 Additional Resources

- [TikTok Developer Documentation](https://developers.tiktok.com/doc/)
- [TikTok Research API Guide](https://developers.tiktok.com/doc/research-api-specs-overview)
- [TikTok Marketing API](https://business-api.tiktok.com/)
- [Rate Limiting Best Practices](https://developers.tiktok.com/doc/basic-api-setup-and-implementation)

## 🎉 What's Next?

After TikTok integration is working:

1. **Instagram Integration** - Similar setup for Instagram Graph API
2. **Real-time Webhooks** - Get instant updates when videos are posted
3. **Advanced Analytics** - Engagement rate calculations, trend analysis
4. **Performance Dashboards** - Visual analytics for campaigns
5. **Automated Reporting** - Weekly/monthly performance reports