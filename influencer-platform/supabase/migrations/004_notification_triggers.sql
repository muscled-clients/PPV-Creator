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
    format('%s applied to your campaign "%s"', v_influencer_name, v_campaign_title),
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
$$ LANGUAGE plpgsql;

-- Trigger for new applications
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
      v_notification_message := format('Your application for "%s" has been approved', v_campaign_title);
    WHEN 'rejected' THEN
      v_notification_title := 'Application Update';
      v_notification_message := format('Your application for "%s" was not selected', v_campaign_title);
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
$$ LANGUAGE plpgsql;

-- Trigger for application status changes
CREATE TRIGGER on_application_status_change
  AFTER UPDATE OF status ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_influencer_application_status();

-- Function to notify brand when submission is created
CREATE OR REPLACE FUNCTION public.notify_brand_new_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
  v_brand_id UUID;
  v_influencer_name TEXT;
BEGIN
  -- Get campaign details
  SELECT title, brand_id INTO v_campaign_title, v_brand_id
  FROM public.campaigns
  WHERE id = NEW.campaign_id;
  
  -- Get influencer name
  SELECT full_name INTO v_influencer_name
  FROM public.user_profiles
  WHERE id = NEW.influencer_id;
  
  -- Create notification
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    data
  ) VALUES (
    v_brand_id,
    'New Content Submission',
    format('%s submitted content for "%s"', v_influencer_name, v_campaign_title),
    'submission_new',
    jsonb_build_object(
      'campaign_id', NEW.campaign_id,
      'submission_id', NEW.id,
      'influencer_id', NEW.influencer_id,
      'action_url', '/brand/submissions'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for new submissions
CREATE TRIGGER on_new_submission
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_brand_new_submission();

-- Function to notify influencer when submission is reviewed
CREATE OR REPLACE FUNCTION public.notify_influencer_submission_status()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
  v_notification_title TEXT;
  v_notification_message TEXT;
BEGIN
  -- Only notify if status changed to approved or rejected
  IF OLD.status = NEW.status OR (NEW.status != 'approved' AND NEW.status != 'rejected') THEN
    RETURN NEW;
  END IF;
  
  -- Get campaign title
  SELECT title INTO v_campaign_title
  FROM public.campaigns
  WHERE id = NEW.campaign_id;
  
  -- Set notification based on status
  CASE NEW.status
    WHEN 'approved' THEN
      v_notification_title := 'Submission Approved!';
      v_notification_message := format('Your submission for "%s" has been approved', v_campaign_title);
    WHEN 'rejected' THEN
      v_notification_title := 'Submission Needs Revision';
      v_notification_message := format('Your submission for "%s" needs revision. Check the feedback.', v_campaign_title);
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
    'submission_' || NEW.status,
    jsonb_build_object(
      'campaign_id', NEW.campaign_id,
      'submission_id', NEW.id,
      'action_url', '/influencer/submissions/' || NEW.id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for submission status changes
CREATE TRIGGER on_submission_status_change
  AFTER UPDATE OF status ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_influencer_submission_status();

-- Function to notify on campaign status changes
CREATE OR REPLACE FUNCTION public.notify_campaign_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_applicant RECORD;
BEGIN
  -- Only notify if campaign becomes active
  IF OLD.status = NEW.status OR NEW.status != 'active' THEN
    RETURN NEW;
  END IF;
  
  -- Notify all approved applicants
  FOR v_applicant IN 
    SELECT influencer_id 
    FROM public.campaign_applications 
    WHERE campaign_id = NEW.id AND status = 'approved'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data
    ) VALUES (
      v_applicant.influencer_id,
      'Campaign Started!',
      format('The campaign "%s" is now active. Start creating content!', NEW.title),
      'campaign_active',
      jsonb_build_object(
        'campaign_id', NEW.id,
        'action_url', '/influencer/campaigns/' || NEW.id
      )
    );
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for campaign status changes
CREATE TRIGGER on_campaign_status_change
  AFTER UPDATE OF status ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.notify_campaign_status_change();

-- Function to notify on payment/transaction creation
CREATE OR REPLACE FUNCTION public.notify_payment_processed()
RETURNS TRIGGER AS $$
DECLARE
  v_campaign_title TEXT;
BEGIN
  -- Get campaign title if available
  IF NEW.campaign_id IS NOT NULL THEN
    SELECT title INTO v_campaign_title
    FROM public.campaigns
    WHERE id = NEW.campaign_id;
  END IF;
  
  -- Create notification based on transaction status
  IF NEW.status = 'completed' THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      data
    ) VALUES (
      NEW.user_id,
      'Payment Processed',
      CASE 
        WHEN v_campaign_title IS NOT NULL THEN
          format('Payment of $%s for "%s" has been processed', NEW.amount, v_campaign_title)
        ELSE
          format('Payment of $%s has been processed', NEW.amount)
      END,
      'payment_completed',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', NEW.amount,
        'action_url', '/influencer/payments'
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for payment processing
CREATE TRIGGER on_payment_processed
  AFTER INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.notify_payment_processed();

-- Function to clean old read notifications (older than 30 days)
CREATE OR REPLACE FUNCTION public.clean_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE read = true 
  AND created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;