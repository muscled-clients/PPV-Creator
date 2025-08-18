-- Safe comprehensive fix for campaigns table
-- This script checks for column existence before making changes

-- Check and rename budget to budget_amount if needed
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'budget') THEN
        ALTER TABLE campaigns RENAME COLUMN budget TO budget_amount;
    END IF;
END $$;

-- Ensure budget_amount exists
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS budget_amount DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Add missing columns that the application uses
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS requirements TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS deliverables TEXT,
ADD COLUMN IF NOT EXISTS price_per_post DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS slots_available INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS slots_filled INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submission_deadline DATE;

-- Make certain columns nullable if they exist
DO $$ 
BEGIN
    -- price_per_post
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'price_per_post'
               AND is_nullable = 'NO') THEN
        ALTER TABLE campaigns ALTER COLUMN price_per_post DROP NOT NULL;
    END IF;
    
    -- slots_available
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'slots_available'
               AND is_nullable = 'NO') THEN
        ALTER TABLE campaigns ALTER COLUMN slots_available DROP NOT NULL;
    END IF;
    
    -- submission_deadline
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'submission_deadline'
               AND is_nullable = 'NO') THEN
        ALTER TABLE campaigns ALTER COLUMN submission_deadline DROP NOT NULL;
    END IF;
    
    -- min_instagram_followers
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'min_instagram_followers'
               AND is_nullable = 'NO') THEN
        ALTER TABLE campaigns ALTER COLUMN min_instagram_followers DROP NOT NULL;
    END IF;
    
    -- min_tiktok_followers
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'min_tiktok_followers'
               AND is_nullable = 'NO') THEN
        ALTER TABLE campaigns ALTER COLUMN min_tiktok_followers DROP NOT NULL;
    END IF;
    
    -- min_engagement_rate
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'min_engagement_rate'
               AND is_nullable = 'NO') THEN
        ALTER TABLE campaigns ALTER COLUMN min_engagement_rate DROP NOT NULL;
    END IF;
END $$;

-- Set default values for columns
ALTER TABLE campaigns 
ALTER COLUMN price_per_post SET DEFAULT 0,
ALTER COLUMN slots_available SET DEFAULT 10,
ALTER COLUMN slots_filled SET DEFAULT 0;

-- Handle submission_deadline default
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'submission_deadline') THEN
        ALTER TABLE campaigns ALTER COLUMN submission_deadline SET DEFAULT (CURRENT_DATE + INTERVAL '30 days');
    END IF;
END $$;

-- Fix platforms column type if needed
DO $$ 
BEGIN
    -- Check if platforms column exists and is of type platform_type[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'campaigns' 
        AND column_name = 'platforms'
        AND udt_name LIKE '%platform_type%'
    ) THEN
        -- Save existing data
        ALTER TABLE campaigns ADD COLUMN platforms_temp TEXT[];
        UPDATE campaigns SET platforms_temp = platforms::TEXT[];
        ALTER TABLE campaigns DROP COLUMN platforms;
        ALTER TABLE campaigns RENAME COLUMN platforms_temp TO platforms;
    END IF;
    
    -- Ensure platforms column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'campaigns' 
        AND column_name = 'platforms'
    ) THEN
        ALTER TABLE campaigns ADD COLUMN platforms TEXT[] DEFAULT '{}';
    END IF;
END $$;

-- Rename niche to categories if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_schema = 'public' 
               AND table_name = 'campaigns' 
               AND column_name = 'niche') THEN
        -- Check if categories already exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_schema = 'public' 
                      AND table_name = 'campaigns' 
                      AND column_name = 'categories') THEN
            ALTER TABLE campaigns RENAME COLUMN niche TO categories;
        ELSE
            -- If categories exists, just drop niche
            ALTER TABLE campaigns DROP COLUMN niche;
        END IF;
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
    cover_letter TEXT,
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

-- Create applications view for backward compatibility
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

-- Drop existing policies if they exist and recreate
DO $$ 
BEGIN
    -- Campaign Applications policies
    DROP POLICY IF EXISTS "Users can view their own applications" ON campaign_applications;
    DROP POLICY IF EXISTS "Brands can view applications to their campaigns" ON campaign_applications;
    DROP POLICY IF EXISTS "Influencers can create applications" ON campaign_applications;
    DROP POLICY IF EXISTS "Brands can update applications to their campaigns" ON campaign_applications;
    
    -- Transactions policies
    DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
    DROP POLICY IF EXISTS "System can create transactions" ON transactions;
    
    -- Submissions policies
    DROP POLICY IF EXISTS "Users can view their own submissions" ON submissions;
    DROP POLICY IF EXISTS "Brands can view submissions to their campaigns" ON submissions;
    DROP POLICY IF EXISTS "Influencers can create submissions" ON submissions;
    DROP POLICY IF EXISTS "Influencers can update their own submissions" ON submissions;
    DROP POLICY IF EXISTS "Brands can update submissions to their campaigns" ON submissions;
EXCEPTION
    WHEN undefined_object THEN
        -- Policies don't exist, continue
        NULL;
END $$;

-- Create RLS Policies for campaign_applications
CREATE POLICY "Users can view their own applications" ON campaign_applications
    FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "Brands can view applications to their campaigns" ON campaign_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_applications.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

CREATE POLICY "Influencers can create applications" ON campaign_applications
    FOR INSERT WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Brands can update applications to their campaigns" ON campaign_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = campaign_applications.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

-- Create RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions" ON transactions
    FOR INSERT WITH CHECK (true);

-- Create RLS Policies for submissions
CREATE POLICY "Users can view their own submissions" ON submissions
    FOR SELECT USING (auth.uid() = influencer_id);

CREATE POLICY "Brands can view submissions to their campaigns" ON submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = submissions.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

CREATE POLICY "Influencers can create submissions" ON submissions
    FOR INSERT WITH CHECK (auth.uid() = influencer_id);

CREATE POLICY "Influencers can update their own submissions" ON submissions
    FOR UPDATE USING (auth.uid() = influencer_id);

CREATE POLICY "Brands can update submissions to their campaigns" ON submissions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM campaigns 
            WHERE campaigns.id = submissions.campaign_id 
            AND campaigns.brand_id = auth.uid()
        )
    );

-- Display the final campaign table structure for verification
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'campaigns'
ORDER BY ordinal_position;