-- Add missing columns to campaigns table if they don't exist
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS deliverables TEXT;

-- Make price_per_post nullable or set a default value
ALTER TABLE campaigns 
ALTER COLUMN price_per_post DROP NOT NULL;

-- Or alternatively, set a default value based on budget_amount
-- ALTER TABLE campaigns 
-- ALTER COLUMN price_per_post SET DEFAULT 0;

-- Update the campaigns table to ensure all columns exist
DO $$ 
BEGIN
    -- Check if requirements column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'campaigns' 
                   AND column_name = 'requirements') THEN
        ALTER TABLE campaigns ADD COLUMN requirements TEXT;
    END IF;
    
    -- Check if categories column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'campaigns' 
                   AND column_name = 'categories') THEN
        ALTER TABLE campaigns ADD COLUMN categories TEXT[] DEFAULT '{}';
    END IF;
    
    -- Check if platforms column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'campaigns' 
                   AND column_name = 'platforms') THEN
        ALTER TABLE campaigns ADD COLUMN platforms TEXT[] DEFAULT '{}';
    END IF;
    
    -- Check if target_audience column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'campaigns' 
                   AND column_name = 'target_audience') THEN
        ALTER TABLE campaigns ADD COLUMN target_audience TEXT;
    END IF;
    
    -- Check if deliverables column exists, if not add it
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'campaigns' 
                   AND column_name = 'deliverables') THEN
        ALTER TABLE campaigns ADD COLUMN deliverables TEXT;
    END IF;
END $$;

-- Create campaign_applications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.campaign_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    message TEXT,
    proposed_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(campaign_id, influencer_id)
);

-- Create transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('payment', 'earning', 'refund')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    post_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
    feedback TEXT,
    metrics JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create applications table (alias for campaign_applications for backward compatibility)
CREATE OR REPLACE VIEW public.applications AS 
SELECT * FROM public.campaign_applications;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_campaigns_categories ON campaigns USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_campaigns_platforms ON campaigns USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);

CREATE INDEX IF NOT EXISTS idx_campaign_applications_campaign_id ON campaign_applications(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_influencer_id ON campaign_applications(influencer_id);
CREATE INDEX IF NOT EXISTS idx_campaign_applications_status ON campaign_applications(status);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_campaign_id ON transactions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_submissions_influencer_id ON submissions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Enable Row Level Security
ALTER TABLE campaign_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_applications
DROP POLICY IF EXISTS "Users can view their own applications" ON campaign_applications;
CREATE POLICY "Users can view their own applications" ON campaign_applications
    FOR SELECT USING (auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Brands can view applications to their campaigns" ON campaign_applications;
CREATE POLICY "Brands can view applications to their campaigns" ON campaign_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_applications.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Influencers can create applications" ON campaign_applications;
CREATE POLICY "Influencers can create applications" ON campaign_applications
    FOR INSERT WITH CHECK (auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Brands can update applications to their campaigns" ON campaign_applications;
CREATE POLICY "Brands can update applications to their campaigns" ON campaign_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_applications.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

-- RLS Policies for transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can create transactions" ON transactions;
CREATE POLICY "System can create transactions" ON transactions
    FOR INSERT WITH CHECK (true);

-- RLS Policies for submissions
DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
CREATE POLICY "Users can view their own submissions" ON submissions
    FOR SELECT USING (auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Brands can view submissions to their campaigns" ON submissions;
CREATE POLICY "Brands can view submissions to their campaigns" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = submissions.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Influencers can create submissions" ON submissions;
CREATE POLICY "Influencers can create submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Influencers can update their own submissions" ON submissions;
CREATE POLICY "Influencers can update their own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = influencer_id);

DROP POLICY IF EXISTS "Brands can update submissions to their campaigns" ON submissions;
CREATE POLICY "Brands can update submissions to their campaigns" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = submissions.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

-- Verify the campaigns table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'campaigns'
ORDER BY ordinal_position;