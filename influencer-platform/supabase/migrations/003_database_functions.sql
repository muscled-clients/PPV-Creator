-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'influencer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update campaign slots
CREATE OR REPLACE FUNCTION public.update_campaign_slots()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    UPDATE public.campaigns 
    SET slots_filled = slots_filled + 1
    WHERE id = NEW.campaign_id;
  ELSIF OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE public.campaigns 
    SET slots_filled = slots_filled - 1
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update campaign slots on application status change
CREATE TRIGGER update_campaign_slots_trigger
  AFTER UPDATE OF status ON public.campaign_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_slots();

-- Function to calculate influencer reputation score
CREATE OR REPLACE FUNCTION public.calculate_reputation_score(influencer_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  score DECIMAL;
  completion_rate DECIMAL;
  approval_rate DECIMAL;
  avg_engagement DECIMAL;
BEGIN
  -- Set default completion rate (will be based on campaign completion in the future)
  completion_rate := 85.0;
  
  -- Calculate approval rate
  SELECT 
    CASE 
      WHEN COUNT(*) > 0 THEN 
        COUNT(CASE WHEN status = 'accepted' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL * 100
      ELSE 0 
    END INTO approval_rate
  FROM public.campaign_applications
  WHERE campaign_applications.influencer_id = calculate_reputation_score.influencer_id;
  
  -- Calculate average engagement from profile
  SELECT 
    COALESCE((instagram_engagement + tiktok_engagement) / 2, 0) INTO avg_engagement
  FROM public.influencer_profiles
  WHERE user_id = calculate_reputation_score.influencer_id;
  
  -- Calculate final score (weighted average)
  score := (completion_rate * 0.4) + (approval_rate * 0.3) + (LEAST(avg_engagement, 10) * 3);
  
  -- Update the influencer profile
  UPDATE public.influencer_profiles
  SET reputation_score = LEAST(score, 100)
  WHERE user_id = calculate_reputation_score.influencer_id;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to process payout
CREATE OR REPLACE FUNCTION public.process_payout(
  p_user_id UUID,
  p_amount DECIMAL,
  p_payment_method payment_method
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_available_balance DECIMAL;
BEGIN
  -- Check available balance
  SELECT available_balance INTO v_available_balance
  FROM public.influencer_profiles
  WHERE user_id = p_user_id;
  
  IF v_available_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Create transaction
  INSERT INTO public.transactions (
    user_id, amount, fee, net_amount, payment_method, status
  ) VALUES (
    p_user_id, 
    p_amount, 
    p_amount * 0.1, -- 10% platform fee
    p_amount * 0.9, -- 90% to influencer
    p_payment_method,
    'pending'
  ) RETURNING id INTO v_transaction_id;
  
  -- Update available balance
  UPDATE public.influencer_profiles
  SET available_balance = available_balance - p_amount
  WHERE user_id = p_user_id;
  
  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql;


-- Function to get campaign statistics
CREATE OR REPLACE FUNCTION public.get_campaign_stats(p_campaign_id UUID)
RETURNS TABLE(
  total_applications BIGINT,
  accepted_applications BIGINT,
  total_spent DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT ca.id) AS total_applications,
    COUNT(DISTINCT CASE WHEN ca.status = 'accepted' THEN ca.id END) AS accepted_applications,
    COALESCE(SUM(CASE WHEN t.status = 'completed' THEN t.amount END), 0) AS total_spent
  FROM public.campaigns c
  LEFT JOIN public.campaign_applications ca ON c.id = ca.campaign_id
  LEFT JOIN public.transactions t ON c.id = t.campaign_id
  WHERE c.id = p_campaign_id
  GROUP BY c.id;
END;
$$ LANGUAGE plpgsql;