-- Safe migration to ensure profile tables have all required columns

-- Create brand_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.brand_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    avatar_url TEXT,
    description TEXT,
    website TEXT,
    industry TEXT,
    size TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to brand_profiles if they don't exist
ALTER TABLE brand_profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS size TEXT;

-- Create influencer_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.influencer_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT,
    avatar_url TEXT,
    bio TEXT,
    follower_count INTEGER DEFAULT 0,
    reputation_score INTEGER DEFAULT 50,
    instagram_handle TEXT,
    tiktok_handle TEXT,
    youtube_handle TEXT,
    twitter_handle TEXT,
    categories TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add missing columns to influencer_profiles if they don't exist
ALTER TABLE influencer_profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
ADD COLUMN IF NOT EXISTS tiktok_handle TEXT,
ADD COLUMN IF NOT EXISTS youtube_handle TEXT,
ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
ADD COLUMN IF NOT EXISTS categories TEXT[] DEFAULT '{}';

-- Drop and recreate the unique constraint on username if needed
DO $$ 
BEGIN
    -- Check if the unique constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'influencer_profiles_username_key'
    ) THEN
        -- Only add if username column exists and constraint doesn't
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'influencer_profiles' 
            AND column_name = 'username'
        ) THEN
            ALTER TABLE influencer_profiles 
            ADD CONSTRAINT influencer_profiles_username_key UNIQUE (username);
        END IF;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_user_id ON influencer_profiles(user_id);

-- Create index on username only if column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'influencer_profiles' 
        AND column_name = 'username'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_influencer_profiles_username ON influencer_profiles(username);
    END IF;
END $$;

-- Enable RLS
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies and recreate
DO $$ 
BEGIN
    -- Brand profiles policies
    DROP POLICY IF EXISTS "Users can view all brand profiles" ON brand_profiles;
    DROP POLICY IF EXISTS "Users can update their own brand profile" ON brand_profiles;
    DROP POLICY IF EXISTS "Users can insert their own brand profile" ON brand_profiles;
    
    -- Influencer profiles policies
    DROP POLICY IF EXISTS "Users can view all influencer profiles" ON influencer_profiles;
    DROP POLICY IF EXISTS "Users can update their own influencer profile" ON influencer_profiles;
    DROP POLICY IF EXISTS "Users can insert their own influencer profile" ON influencer_profiles;
EXCEPTION
    WHEN undefined_object THEN
        NULL;
END $$;

-- Create RLS policies for brand_profiles
CREATE POLICY "Users can view all brand profiles" ON brand_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own brand profile" ON brand_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand profile" ON brand_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for influencer_profiles
CREATE POLICY "Users can view all influencer profiles" ON influencer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own influencer profile" ON influencer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own influencer profile" ON influencer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Display the table structures for verification
SELECT 'brand_profiles columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'brand_profiles'
ORDER BY ordinal_position;

SELECT 'influencer_profiles columns:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'influencer_profiles'
ORDER BY ordinal_position;