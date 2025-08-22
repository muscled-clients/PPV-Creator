# Debugging Withdrawal Feature - Step by Step Guide

## The Problem
Applications are not being deleted from the database when influencers click "Withdraw Application".

## Root Cause Analysis
After testing, the deletion logic works fine at the database level, but fails in the browser context due to **authentication issues**.

## Step-by-Step Debugging Process

### 1. **Test Authentication**
First, verify that the user is properly logged in:

1. Open your app in the browser
2. Login as an **influencer** (not brand)
3. Go to `/test-withdrawal` (we created this test page)
4. Open browser dev tools → Console tab
5. Enter an application ID that belongs to the logged-in influencer
6. Click "Test Withdrawal"
7. Watch the console logs

### 2. **Expected Console Output**
You should see logs like:
```
[UI] Starting withdrawal for application: xxx
[UI] Calling withdrawApplication function...
[withdrawApplication] Starting withdrawal for: xxx
[withdrawApplication] User check: [user-id] [null/undefined]
```

### 3. **Common Issues & Fixes**

#### Issue A: "Authentication required" error
**Cause**: User session not found in server action
**Solution**: 
- Make sure you're logged in
- Check if cookies are enabled
- Try logging out and back in

#### Issue B: "Application not found" error  
**Cause**: Application doesn't exist or wrong ID
**Solution**: 
- Use a valid application ID from your database
- Make sure the application belongs to the logged-in user

#### Issue C: "You can only withdraw your own applications"
**Cause**: User ID mismatch
**Solution**:
- Make sure the logged-in user is the same as the application owner
- Check user IDs in database vs. session

#### Issue D: Network error or no response
**Cause**: Server action not being called
**Solution**:
- Check Network tab in dev tools
- Look for POST requests to server actions
- Check for any JavaScript errors

## Quick Fix Options

### Option 1: Add RLS Policy (Recommended)
If the issue is RLS-related, run this SQL in Supabase:

```sql
-- Enable RLS on campaign_applications if not already enabled
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Add DELETE policy for influencers to delete their own applications
CREATE POLICY "Influencers can delete their own applications"
ON public.campaign_applications
FOR DELETE
TO authenticated
USING (influencer_id = auth.uid());

-- Add other missing policies if needed
CREATE POLICY "Influencers can view their own applications"
ON public.campaign_applications
FOR SELECT
TO authenticated
USING (influencer_id = auth.uid());

CREATE POLICY "Brands can view applications for their campaigns"
ON public.campaign_applications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id 
    AND c.brand_id = auth.uid()
  )
);
```

### Option 2: Disable RLS Temporarily (NOT Recommended)
```sql
-- This removes security but allows testing
ALTER TABLE public.campaign_applications DISABLE ROW LEVEL SECURITY;
```

## Testing the Fix

1. Apply the RLS policy (Option 1 above)
2. Login as an influencer
3. Go to "My Applications"
4. Find a pending application
5. Click "Withdraw Application"
6. Confirm the dialog
7. Application should disappear
8. Try applying to the same campaign again - it should work!

## Verification Commands

Check if the fix worked:
```sql
-- Check if application was actually deleted
SELECT count(*) FROM campaign_applications WHERE id = 'your-app-id';
-- Should return 0

-- Check if you can reapply
-- Try submitting a new application to the same campaign
-- It should succeed
```

## Production Deployment

Once fixed, remove the debug logs:

1. Remove console.log statements from:
   - `lib/actions/application-actions-enhanced.ts`
   - `components/applications/application-card-enhanced.tsx`
   - `components/applications/application-manager.tsx`

2. Delete test files:
   - `app/test-withdrawal/page.tsx`
   - `scripts/test-*` files
   - `scripts/debug-*` files

This will clean up the codebase for production.