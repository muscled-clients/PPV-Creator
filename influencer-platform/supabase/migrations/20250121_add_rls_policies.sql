-- Enable RLS on campaign_applications table (if not already enabled)
ALTER TABLE public.campaign_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Influencers can view their own applications
CREATE POLICY "Influencers can view their own applications"
ON public.campaign_applications
FOR SELECT
TO authenticated
USING (influencer_id = auth.uid());

-- Policy: Brands can view applications for their campaigns
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

-- Policy: Influencers can insert their own applications
CREATE POLICY "Influencers can insert their own applications"
ON public.campaign_applications
FOR INSERT
TO authenticated
WITH CHECK (influencer_id = auth.uid());

-- Policy: Brands can update applications for their campaigns (approve/reject)
CREATE POLICY "Brands can update applications for their campaigns"
ON public.campaign_applications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns c 
    WHERE c.id = campaign_id 
    AND c.brand_id = auth.uid()
  )
);

-- Policy: Influencers can delete their own applications (withdraw)
CREATE POLICY "Influencers can delete their own applications"
ON public.campaign_applications
FOR DELETE
TO authenticated
USING (influencer_id = auth.uid());

-- Add comments for documentation
COMMENT ON POLICY "Influencers can view their own applications" ON public.campaign_applications 
IS 'Allows influencers to view their own application submissions';

COMMENT ON POLICY "Brands can view applications for their campaigns" ON public.campaign_applications 
IS 'Allows brands to view applications submitted to their campaigns';

COMMENT ON POLICY "Influencers can insert their own applications" ON public.campaign_applications 
IS 'Allows influencers to submit applications to campaigns';

COMMENT ON POLICY "Brands can update applications for their campaigns" ON public.campaign_applications 
IS 'Allows brands to approve/reject applications for their campaigns';

COMMENT ON POLICY "Influencers can delete their own applications" ON public.campaign_applications 
IS 'Allows influencers to withdraw (delete) their own pending applications';