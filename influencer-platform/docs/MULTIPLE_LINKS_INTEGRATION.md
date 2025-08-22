# Multiple Links Feature - Integration Guide

## Overview
This guide explains how to integrate the new multiple content links feature into your existing application pages.

## New Components Created

### 1. **ApplicationFormEnhanced** (`components/applications/application-form-enhanced.tsx`)
- Replaces the old application form
- Supports dynamic addition/removal of content links
- Platform selection for each link
- Real-time URL validation

### 2. **ApplicationCardEnhanced** (`components/applications/application-card-enhanced.tsx`)
- Replaces the old application card
- Shows all submitted links with their statuses
- Expandable view for link details
- Integrated approval modal for brands

### 3. **ApplicationLinksDisplay** (`components/applications/application-links-display.tsx`)
- Reusable component for displaying links
- Different views for influencer/brand roles
- Shows selection status and view counts

### 4. **LinkStatusBadge** (`components/applications/link-status-badge.tsx`)
- Visual status indicators
- Shows pending/selected/not_selected states
- Optional view count display

### 5. **ApplicationApprovalModal** (`components/applications/application-approval-modal.tsx`)
- Brand approval interface
- Individual link selection
- Bulk approve/reject options

## Database Changes

### New Table: `application_content_links`
```sql
- id (UUID)
- application_id (UUID, FK)
- platform ('instagram' | 'tiktok')
- content_url (TEXT)
- is_selected (BOOLEAN)
- selection_status ('pending' | 'selected' | 'not_selected')
- views_tracked (INTEGER)
- last_view_check (TIMESTAMP)
- selection_date (TIMESTAMP)
```

## Integration Steps

### Step 1: Update Campaign Application Page

Replace the old application form in `/app/influencer/campaigns/[id]/page.tsx`:

```tsx
// Old import
// import { ApplicationForm } from '@/components/applications/application-form'

// New import
import { ApplicationFormEnhanced } from '@/components/applications/application-form-enhanced'

// In your component
<ApplicationFormEnhanced
  campaign={campaign}
  userId={user.id}
  onSuccess={() => router.push('/influencer/applications')}
  onCancel={() => router.back()}
/>
```

### Step 2: Update Applications List Pages

#### For Influencer Dashboard (`/app/influencer/applications/page.tsx`):

```tsx
// Import enhanced components
import { ApplicationCardEnhanced } from '@/components/applications/application-card-enhanced'
import { getApplicationsWithLinks } from '@/lib/actions/application-actions-enhanced'

// Fetch applications with links
const applications = await getApplicationsWithLinks({
  influencer_id: user.id
})

// Render enhanced cards
{applications.map(app => (
  <ApplicationCardEnhanced
    key={app.id}
    application={app}
    userRole="influencer"
    showActions={true}
  />
))}
```

#### For Brand Dashboard (`/app/brand/applications/page.tsx`):

```tsx
// Import enhanced components
import { ApplicationCardEnhanced } from '@/components/applications/application-card-enhanced'
import { getApplicationsWithLinks } from '@/lib/actions/application-actions-enhanced'

// Fetch applications with links
const applications = await getApplicationsWithLinks({
  brand_id: user.id
})

// Render enhanced cards
{applications.map(app => (
  <ApplicationCardEnhanced
    key={app.id}
    application={app}
    userRole="brand"
    showActions={true}
    onStatusChange={handleStatusChange}
  />
))}
```

### Step 3: Set Up View Tracking

Add a cron job or scheduled task to update view counts:

```tsx
// In an API route or server action
import { batchUpdateViews } from '@/lib/services/view-tracking-service'

// Update views for all approved applications
const result = await batchUpdateViews()
console.log(`Updated views for ${result.updated} applications`)
```

### Step 4: Update Type Definitions

Add the new types to your type files:

```tsx
// In your types file
export interface ContentLink {
  id: string
  platform: 'instagram' | 'tiktok'
  content_url: string
  is_selected: boolean
  selection_status: 'pending' | 'selected' | 'not_selected'
  views_tracked: number
  selection_date?: string
}
```

## Migration Strategy

### Phase 1: Deploy Database Changes
1. Run the migration script: `20250121_add_multiple_content_links.sql`
2. Existing data will be automatically migrated

### Phase 2: Deploy New Components (Parallel)
1. Deploy all new components without removing old ones
2. Test with a small group of users

### Phase 3: Gradual Rollout
1. Use feature flags to control which users see the new UI
2. Monitor for issues

### Phase 4: Complete Migration
1. Switch all users to new components
2. Remove old components after confirmation

## API Integration for View Tracking

### Instagram API Integration
```tsx
// Example Instagram integration
async function fetchInstagramViews(postUrl: string) {
  const postId = extractPostId(postUrl)
  const response = await fetch(`https://graph.instagram.com/${postId}`, {
    params: {
      fields: 'impressions,reach',
      access_token: process.env.INSTAGRAM_ACCESS_TOKEN
    }
  })
  const data = await response.json()
  return data.impressions || data.reach || 0
}
```

### TikTok API Integration
```tsx
// Example TikTok integration
async function fetchTikTokViews(videoUrl: string) {
  const videoId = extractVideoId(videoUrl)
  const response = await fetch(`https://open-api.tiktok.com/video/data/`, {
    headers: {
      'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`
    },
    body: JSON.stringify({ video_id: videoId })
  })
  const data = await response.json()
  return data.statistics.play_count || 0
}
```

## Testing Checklist

- [ ] Influencer can add multiple links
- [ ] Influencer can remove links (minimum 1 required)
- [ ] Platform selection works correctly
- [ ] URL validation accepts only valid social media links
- [ ] Application submission saves all links
- [ ] Brand sees all submitted links
- [ ] Brand can select specific links to approve
- [ ] Brand can reject entire application
- [ ] Selected links show as "Selected" status
- [ ] Non-selected links show as "Not Selected" status
- [ ] View tracking updates only for selected links
- [ ] Earnings calculate based on selected links only
- [ ] Backward compatibility with existing single URL fields
- [ ] Mobile responsive design works

## Troubleshooting

### Issue: Links not saving
- Check if `application_content_links` table exists
- Verify RLS policies are enabled
- Check user permissions

### Issue: View tracking not working
- Verify API credentials are set
- Check if links are marked as selected
- Ensure cron job is running

### Issue: Old applications not showing links
- Run migration script to import existing URLs
- Check backward compatibility fields

## Support
For issues or questions, please check:
- Database logs for migration errors
- Browser console for client-side errors
- Server logs for API errors