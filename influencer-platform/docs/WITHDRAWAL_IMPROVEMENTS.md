# Withdrawal Feature - Current Behavior & Suggested Improvements

## Current Behavior When Influencer Withdraws

### What Happens Now:
1. **Application Status**: Changes to 'withdrawn'
2. **Content Links**: Marked as not selected
3. **UI Update**: Shows withdrawn status in gray
4. **Access**: Application becomes read-only

### What DOESN'T Happen (But Could Be Added):

## Suggested Improvements

### 1. **Notification System**
```typescript
// Add to updateApplicationWithLinks function
if (data.status === 'withdrawn' && isInfluencer) {
  // Notify the brand
  await createNotification({
    user_id: application.campaigns.brand_id,
    type: 'application_withdrawn',
    title: 'Application Withdrawn',
    message: `An influencer has withdrawn their application for ${application.campaigns.title}`,
    link: `/brand/applications`
  })
}
```

### 2. **Re-application Logic**
Currently, influencers cannot re-apply after withdrawal. You could add:

```typescript
// Modify createApplicationEnhanced to allow re-application after withdrawal
const { data: existingApplication } = await supabase
  .from('campaign_applications')
  .select('id, status')
  .eq('campaign_id', data.campaign_id)
  .eq('influencer_id', user.id)
  .single()

if (existingApplication) {
  if (existingApplication.status === 'withdrawn') {
    // Allow re-application by updating the existing record
    return await updateApplication(existingApplication.id, {
      status: 'pending',
      message: data.message,
      // ... other fields
    })
  } else {
    return { success: false, error: 'You have already applied to this campaign' }
  }
}
```

### 3. **Withdrawal Reason**
Add a reason field for better communication:

```typescript
// Add to database
ALTER TABLE campaign_applications 
ADD COLUMN withdrawal_reason TEXT,
ADD COLUMN withdrawn_at TIMESTAMP WITH TIME ZONE;

// Update the withdrawal function
export async function withdrawApplication(
  applicationId: string,
  reason?: string
) {
  // ... existing code
  
  const updateData = {
    status: 'withdrawn',
    withdrawal_reason: reason,
    withdrawn_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
  
  // ... rest of the function
}
```

### 4. **Email Notifications**
```typescript
// Add email service integration
if (data.status === 'withdrawn') {
  await sendEmail({
    to: brandEmail,
    subject: 'Application Withdrawn',
    template: 'application-withdrawn',
    data: {
      campaignTitle: application.campaigns.title,
      influencerName: application.influencer.full_name,
      withdrawalReason: data.withdrawal_reason || 'No reason provided'
    }
  })
}
```

### 5. **Analytics Tracking**
```typescript
// Track withdrawal metrics
await supabase
  .from('campaign_analytics')
  .insert({
    campaign_id: application.campaign_id,
    event_type: 'application_withdrawn',
    influencer_id: application.influencer_id,
    created_at: new Date().toISOString()
  })
```

### 6. **Slot Management**
If the campaign has limited slots:

```typescript
// Free up the slot when withdrawn
if (data.status === 'withdrawn') {
  await supabase
    .from('campaigns')
    .update({
      slots_filled: campaign.slots_filled - 1
    })
    .eq('id', application.campaign_id)
}
```

## Implementation Priority

1. **High Priority**: 
   - Allow re-application after withdrawal
   - Add withdrawal reason field

2. **Medium Priority**:
   - Email/in-app notifications to brand
   - Slot management

3. **Low Priority**:
   - Analytics tracking
   - Withdrawal history log

## Database Changes Needed

```sql
-- Add withdrawal tracking fields
ALTER TABLE campaign_applications 
ADD COLUMN withdrawal_reason TEXT,
ADD COLUMN withdrawn_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN can_reapply BOOLEAN DEFAULT false;

-- Add notification table if not exists
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  type VARCHAR(50),
  title TEXT,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```