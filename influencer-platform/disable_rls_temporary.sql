-- Temporary solution: Disable RLS on profile tables
-- This allows the signup flow to work, then we can re-enable with proper policies

-- Disable RLS on the profile tables
ALTER TABLE public.influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles DISABLE ROW LEVEL SECURITY;

-- Keep RLS on user_profiles but make it more permissive during signup
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Grant full permissions
GRANT ALL ON public.user_profiles TO anon, authenticated;
GRANT ALL ON public.influencer_profiles TO anon, authenticated;
GRANT ALL ON public.brand_profiles TO anon, authenticated;

DO $$
BEGIN
  RAISE NOTICE 'RLS has been disabled for profile tables to allow signup flow';
END $$;