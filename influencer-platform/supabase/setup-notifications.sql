-- =====================================================
-- NOTIFICATIONS SYSTEM SETUP
-- Run this script in your Supabase SQL editor
-- =====================================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 3. Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies
-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System/triggers can insert notifications for any user
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- 5. Create notification trigger functions

-- Function to create notification for new campaign application
CREATE OR REPLACE FUNCTION public.notify_brand_new_application()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
  v_influencer_name TEXT;
  v_brand_id UUID;
BEGIN
  -- Get campaign details
  SELECT title, brand_id INTO v_campaign_title, v_brand_id
  FROM public.campaigns
  WHERE id = NEW.campaign_id;
  
  -- Get influencer name
  SELECT full_name INTO v_influencer_name
  FROM public.user_profiles
  WHERE id = NEW.influencer_id;
  
  -- Create notification for brand
  INSERT INTO public.notifications (
    user_id, 
    title, 
    message, 
    type,
    data
  ) VALUES (
    v_brand_id,
    'New Application Received',
    format('%s applied to your campaign "%s"', COALESCE(v_influencer_name, 'An influencer'), COALESCE(v_campaign_title, 'your campaign')),
    'application_new',
    jsonb_build_object(
      'campaign_id', NEW.campaign_id,
      'application_id', NEW.id,
      'influencer_id', NEW.influencer_id,
      'action_url', '/brand/applications'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new applications
DROP TRIGGER IF EXISTS on_new_application ON public.campaign_applications;
CREATE TRIGGER on_new_application
  AFTER INSERT ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_brand_new_application();

-- Function to notify influencer of application status change
CREATE OR REPLACE FUNCTION public.notify_influencer_application_status()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
  v_notification_title TEXT;
  v_notification_message TEXT;
BEGIN
  -- Only notify if status actually changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get campaign title
  SELECT title INTO v_campaign_title
  FROM public.campaigns
  WHERE id = NEW.campaign_id;
  
  -- Set notification based on status
  CASE NEW.status
    WHEN 'approved' THEN
      v_notification_title := 'Application Approved!';
      v_notification_message := format('Your application for "%s" has been approved', COALESCE(v_campaign_title, 'the campaign'));
    WHEN 'rejected' THEN
      v_notification_title := 'Application Update';
      v_notification_message := format('Your application for "%s" was not selected', COALESCE(v_campaign_title, 'the campaign'));
    ELSE
      RETURN NEW; -- Don't notify for other statuses
  END CASE;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    data
  ) VALUES (
    NEW.influencer_id,
    v_notification_title,
    v_notification_message,
    'application_' || NEW.status,
    jsonb_build_object(
      'campaign_id', NEW.campaign_id,
      'application_id', NEW.id,
      'action_url', '/influencer/applications'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for application status changes
DROP TRIGGER IF EXISTS on_application_status_change ON public.campaign_applications;
CREATE TRIGGER on_application_status_change
  AFTER UPDATE OF status ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_influencer_application_status();

-- 6. Insert sample notifications for testing
-- (Replace the user_id with an actual brand user ID from your database)
DO $$
DECLARE
  v_brand_user_id UUID;
BEGIN
  -- Get the first brand user
  SELECT id INTO v_brand_user_id
  FROM public.user_profiles
  WHERE role = 'brand'
  LIMIT 1;
  
  IF v_brand_user_id IS NOT NULL THEN
    -- Insert sample notifications
    INSERT INTO public.notifications (user_id, title, message, type, data, read) VALUES
    (v_brand_user_id, 'Welcome to Your Brand Dashboard!', 'Start by creating your first campaign to connect with influencers.', 'system', 
     '{"action_url": "/brand/campaigns/create"}'::jsonb, false),
    
    (v_brand_user_id, 'New Application Received', 'Sarah Johnson applied to your "Summer Fashion Campaign"', 'application_new',
     '{"campaign_id": "sample-1", "influencer_name": "Sarah Johnson", "action_url": "/brand/applications"}'::jsonb, false),
    
    (v_brand_user_id, 'Campaign Performance Update', 'Your "Tech Product Review" campaign reached 10,000 impressions', 'campaign_milestone',
     '{"campaign_id": "sample-2", "milestone": "10k_impressions", "action_url": "/brand/campaigns"}'::jsonb, false),
    
    (v_brand_user_id, 'Payment Processed', 'Payment of $500 sent to influencer Mike Chen', 'payment_completed',
     '{"amount": 500, "influencer_name": "Mike Chen", "action_url": "/brand/payments"}'::jsonb, true),
    
    (v_brand_user_id, 'New Content Submission', 'Alex Kim submitted content for "Beauty Product Launch"', 'submission_new',
     '{"campaign_id": "sample-3", "influencer_name": "Alex Kim", "action_url": "/brand/submissions"}'::jsonb, false),
    
    (v_brand_user_id, 'Campaign Ending Soon', 'Your "Holiday Sale Campaign" ends in 3 days', 'campaign_reminder',
     '{"campaign_id": "sample-4", "days_remaining": 3, "action_url": "/brand/campaigns"}'::jsonb, true);
    
    RAISE NOTICE 'Sample notifications created for brand user %', v_brand_user_id;
  ELSE
    RAISE NOTICE 'No brand users found. Sample notifications not created.';
  END IF;
END $$;

-- 7. Grant necessary permissions
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

-- 8. Add notification_preferences column to user_profiles if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN notification_preferences JSONB DEFAULT '{
      "email_notifications": true,
      "push_notifications": true,
      "application_notifications": true,
      "campaign_notifications": true,
      "payment_notifications": true,
      "message_notifications": true,
      "system_notifications": true
    }'::jsonb;
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Notifications system setup complete!';
  RAISE NOTICE 'You should now be able to:';
  RAISE NOTICE '- View notifications in the dashboard';
  RAISE NOTICE '- Mark notifications as read/unread';
  RAISE NOTICE '- Delete notifications';
  RAISE NOTICE '- Receive automatic notifications for various events';
END $$;