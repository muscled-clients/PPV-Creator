-- Ensure brand_profiles and influencer_profiles tables exist

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

-- Create influencer_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.influencer_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON brand_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_user_id ON influencer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_influencer_profiles_username ON influencer_profiles(username);

-- Enable RLS
ALTER TABLE brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for brand_profiles
DROP POLICY IF EXISTS "Users can view all brand profiles" ON brand_profiles;
CREATE POLICY "Users can view all brand profiles" ON brand_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own brand profile" ON brand_profiles;
CREATE POLICY "Users can update their own brand profile" ON brand_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own brand profile" ON brand_profiles;
CREATE POLICY "Users can insert their own brand profile" ON brand_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for influencer_profiles
DROP POLICY IF EXISTS "Users can view all influencer profiles" ON influencer_profiles;
CREATE POLICY "Users can view all influencer profiles" ON influencer_profiles
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own influencer profile" ON influencer_profiles;
CREATE POLICY "Users can update their own influencer profile" ON influencer_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own influencer profile" ON influencer_profiles;
CREATE POLICY "Users can insert their own influencer profile" ON influencer_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);