-- Add missing columns to campaign_applications table
ALTER TABLE public.campaign_applications 
ADD COLUMN IF NOT EXISTS deliverables TEXT,
ADD COLUMN IF NOT EXISTS instagram_content_url TEXT,
ADD COLUMN IF NOT EXISTS tiktok_content_url TEXT;

-- Also ensure message column exists (some migrations use cover_letter instead)
DO $$ 
BEGIN
    -- Check if cover_letter exists but message doesn't
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'cover_letter'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'message'
    ) THEN
        -- Rename cover_letter to message
        ALTER TABLE public.campaign_applications 
        RENAME COLUMN cover_letter TO message;
    ELSIF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'campaign_applications' 
        AND column_name = 'message'
    ) THEN
        -- Add message column if neither exists
        ALTER TABLE public.campaign_applications 
        ADD COLUMN message TEXT;
    END IF;
END $$;

-- Add comment to explain the purpose of these columns
COMMENT ON COLUMN public.campaign_applications.deliverables IS 'Proposed deliverables by the influencer';
COMMENT ON COLUMN public.campaign_applications.instagram_content_url IS 'URL to Instagram content created for this campaign';
COMMENT ON COLUMN public.campaign_applications.tiktok_content_url IS 'URL to TikTok content created for this campaign';
COMMENT ON COLUMN public.campaign_applications.message IS 'Application message from the influencer';