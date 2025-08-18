-- Fix RLS policies for influencer_profiles and brand_profiles tables

-- 1. Drop all existing policies for influencer_profiles
DROP POLICY IF EXISTS "Influencers can view own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Influencers can update own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Influencers can insert own profile" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Public can view influencer profiles" ON public.influencer_profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.influencer_profiles;

-- 2. Drop all existing policies for brand_profiles
DROP POLICY IF EXISTS "Brands can view own profile" ON public.brand_profiles;
DROP POLICY IF EXISTS "Brands can update own profile" ON public.brand_profiles;
DROP POLICY IF EXISTS "Brands can insert own profile" ON public.brand_profiles;
DROP POLICY IF EXISTS "Public can view brand profiles" ON public.brand_profiles;
DROP POLICY IF EXISTS "Service role bypass" ON public.brand_profiles;

-- 3. Create comprehensive policies for influencer_profiles
CREATE POLICY "Enable insert for users" 
  ON public.influencer_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users" 
  ON public.influencer_profiles FOR SELECT 
  USING (true);  -- Anyone can view influencer profiles

CREATE POLICY "Enable update for users" 
  ON public.influencer_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users" 
  ON public.influencer_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- 4. Create comprehensive policies for brand_profiles
CREATE POLICY "Enable insert for users" 
  ON public.brand_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users" 
  ON public.brand_profiles FOR SELECT 
  USING (true);  -- Anyone can view brand profiles

CREATE POLICY "Enable update for users" 
  ON public.brand_profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users" 
  ON public.brand_profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- 5. Also ensure campaigns table has proper policies
DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Brands can manage own campaigns" ON public.campaigns;

CREATE POLICY "Enable read access for all users" 
  ON public.campaigns FOR SELECT 
  USING (status = 'active' OR auth.uid() = brand_id);

CREATE POLICY "Enable insert for brands" 
  ON public.campaigns FOR INSERT 
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Enable update for campaign owners" 
  ON public.campaigns FOR UPDATE 
  USING (auth.uid() = brand_id)
  WITH CHECK (auth.uid() = brand_id);

CREATE POLICY "Enable delete for campaign owners" 
  ON public.campaigns FOR DELETE 
  USING (auth.uid() = brand_id);

-- 6. Ensure RLS is enabled on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 7. Grant proper permissions
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.influencer_profiles TO authenticated;
GRANT ALL ON public.brand_profiles TO authenticated;
GRANT ALL ON public.campaigns TO authenticated;

-- 8. Test message
DO $$
BEGIN
  RAISE NOTICE 'RLS policies have been fixed successfully!';
END $$;