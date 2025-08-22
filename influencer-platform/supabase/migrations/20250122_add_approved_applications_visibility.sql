-- Add policy to allow all authenticated users to view approved applications
-- This enables the showcase feature where influencers can see approved applications as inspiration

CREATE POLICY "Anyone can view approved applications for inspiration"
ON public.campaign_applications
FOR SELECT
TO authenticated
USING (status = 'approved');

-- Add comment for documentation
COMMENT ON POLICY "Anyone can view approved applications for inspiration" ON public.campaign_applications 
IS 'Allows all authenticated users to view approved applications for inspiration and showcase purposes';