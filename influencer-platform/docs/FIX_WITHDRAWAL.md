# Fix for Withdrawal Feature

## Problem
The withdrawal feature is not working because the database check constraint on `campaign_applications.status` doesn't include 'withdrawn' as a valid status value.

## Error Details
```
message: 'new row for relation "campaign_applications" violates check constraint "campaign_applications_status_check"'
```

## Solution
You need to run TWO migration files in your Supabase database:

### 1. First Migration - Add Content Links Table (if not already done)
File: `supabase/migrations/20250121_add_multiple_content_links.sql`

This creates the `application_content_links` table for multiple content links support.

### 2. Second Migration - Add Withdrawn Status
File: `supabase/migrations/20250121_add_withdrawn_status.sql`

This updates the check constraint to allow 'withdrawn' as a valid status.

## Steps to Apply Both Migrations

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to the SQL Editor section
3. Run the first migration (if not already done):
   - Copy contents of `supabase/migrations/20250121_add_multiple_content_links.sql`
   - Paste and click "Run"
4. Run the second migration:
   - Copy contents of `supabase/migrations/20250121_add_withdrawn_status.sql`
   - Paste and click "Run"

### Quick SQL for Withdrawn Status Fix
If you just need to fix the withdrawal issue, run this SQL:

```sql
-- Update the status check constraint to include 'withdrawn'
ALTER TABLE public.campaign_applications 
DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

ALTER TABLE public.campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn'));
```

## Verification
After applying the migrations, test the withdrawal feature:
1. Login as an influencer
2. Go to "My Applications"
3. Find a pending application
4. Click "Withdraw Application"
5. Confirm the withdrawal

The application should now be marked as "Withdrawn" successfully.

## Code Changes Already Applied
The following code changes have been made to support withdrawal:
- ✅ Updated `updateApplicationWithLinks` to handle withdrawn status
- ✅ Added permission checks for withdrawal (only influencer can withdraw)
- ✅ Added error handling in the UI component
- ✅ Updated status handling for content links when withdrawing