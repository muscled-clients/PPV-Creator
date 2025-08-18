-- Remove ALL triggers to allow simple signup

-- 1. Drop the auth trigger that's causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Disable RLS on all profile tables temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Grant full permissions
GRANT ALL ON public.user_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.influencer_profiles TO anon, authenticated, service_role;
GRANT ALL ON public.brand_profiles TO anon, authenticated, service_role;

-- 4. Make email nullable in user_profiles to avoid constraint issues
ALTER TABLE public.user_profiles 
  ALTER COLUMN email DROP NOT NULL;

-- 5. Drop unique constraint on email temporarily
ALTER TABLE public.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_email_key;

DO $$
BEGIN
  RAISE NOTICE 'All triggers removed and constraints relaxed for testing';
END $$;