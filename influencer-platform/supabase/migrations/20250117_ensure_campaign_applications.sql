-- Ensure campaign_applications table exists with all required columns
CREATE TABLE IF NOT EXISTS public.campaign_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  proposed_rate DECIMAL(10,2),
  message TEXT,
  deliverables TEXT,
  instagram_content_url TEXT,
  tiktok_content_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, influencer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON public.campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_id ON public.campaign_applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON public.campaign_applications(status);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_applied_at ON public.campaign_applications(applied_at DESC);

-- Enable RLS
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own applications" ON public.campaign_applications;
DROP POLICY IF EXISTS "Influencers can create applications" ON public.campaign_applications;
DROP POLICY IF EXISTS "Influencers can update their own pending applications" ON public.campaign_applications;
DROP POLICY IF EXISTS "Brand owners can view applications for their campaigns" ON public.campaign_applications;
DROP POLICY IF EXISTS "Brand owners can update application status" ON public.campaign_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON public.campaign_applications;
DROP POLICY IF EXISTS "Admins can manage all applications" ON public.campaign_applications;

-- Create RLS policies
-- Influencers can view their own applications
CREATE POLICY "Users can view their own applications"
ON public.campaign_applications FOR SELECT
TO authenticated
USING (auth.uid() = influencer_id);

-- Influencers can create applications
CREATE POLICY "Influencers can create applications"
ON public.campaign_applications FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = influencer_id
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'influencer'
  )
);

-- Influencers can update their own pending applications
CREATE POLICY "Influencers can update their own pending applications"
ON public.campaign_applications FOR UPDATE
TO authenticated
USING (auth.uid() = influencer_id AND status = 'pending')
WITH CHECK (auth.uid() = influencer_id);

-- Brand owners can view applications for their campaigns
CREATE POLICY "Brand owners can view applications for their campaigns"
ON public.campaign_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_applications.campaign_id
    AND c.brand_id = auth.uid()
  )
);

-- Brand owners can update application status for their campaigns
CREATE POLICY "Brand owners can update application status"
ON public.campaign_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_applications.campaign_id
    AND c.brand_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = campaign_applications.campaign_id
    AND c.brand_id = auth.uid()
  )
);

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.campaign_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can manage all applications
CREATE POLICY "Admins can manage all applications"
ON public.campaign_applications FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS handle_campaign_applications_updated_at ON public.campaign_applications;
CREATE TRIGGER handle_campaign_applications_updated_at
BEFORE UPDATE ON public.campaign_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();