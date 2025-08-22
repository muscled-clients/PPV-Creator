-- Update the status check constraint to include 'withdrawn'
ALTER TABLE public.campaign_applications 
DROP CONSTRAINT IF EXISTS campaign_applications_status_check;

ALTER TABLE public.campaign_applications 
ADD CONSTRAINT campaign_applications_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn'));