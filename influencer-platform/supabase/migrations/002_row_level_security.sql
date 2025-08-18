-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can view all profiles" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Influencer Profiles Policies
CREATE POLICY "Anyone can view influencer profiles" ON public.influencer_profiles
  FOR SELECT USING (true);

CREATE POLICY "Influencers can update own profile" ON public.influencer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Influencers can insert own profile" ON public.influencer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Brand Profiles Policies
CREATE POLICY "Anyone can view brand profiles" ON public.brand_profiles
  FOR SELECT USING (true);

CREATE POLICY "Brands can update own profile" ON public.brand_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Brands can insert own profile" ON public.brand_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Campaigns Policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (status IN ('active', 'completed'));

CREATE POLICY "Brands can view own campaigns" ON public.campaigns
  FOR SELECT USING (auth.uid() = brand_id);

CREATE POLICY "Brands can insert own campaigns" ON public.campaigns
  FOR INSERT WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Brands can update own campaigns" ON public.campaigns
  FOR UPDATE USING (auth.uid() = brand_id);

CREATE POLICY "Brands can delete own draft campaigns" ON public.campaigns
  FOR DELETE USING (auth.uid() = brand_id AND status = 'draft');

-- Campaign Applications Policies
CREATE POLICY "Influencers can view own applications" ON public.campaign_applications
  FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "Brands can view applications for their campaigns" ON public.campaign_applications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_applications.campaign_id 
      AND campaigns.brand_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can create applications" ON public.campaign_applications
  FOR INSERT WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Influencers can update own pending applications" ON public.campaign_applications
  FOR UPDATE USING (auth.uid() = influencer_id AND status = 'pending');

CREATE POLICY "Brands can update applications for their campaigns" ON public.campaign_applications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campaigns 
      WHERE campaigns.id = campaign_applications.campaign_id 
      AND campaigns.brand_id = auth.uid()
    )
  );


-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true); -- Will be restricted to service role in production

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true); -- Will be restricted to service role in production