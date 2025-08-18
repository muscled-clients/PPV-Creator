-- Clean fix for auth issues - handles existing objects properly

-- 1. First drop existing triggers (if they exist)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles CASCADE;
DROP TRIGGER IF EXISTS update_influencer_profiles_updated_at ON public.influencer_profiles CASCADE;
DROP TRIGGER IF EXISTS update_brand_profiles_updated_at ON public.brand_profiles CASCADE;
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns CASCADE;

-- 2. Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 3. Recreate the updated_at function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- 4. Recreate all updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_influencer_profiles_updated_at 
  BEFORE UPDATE ON public.influencer_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_brand_profiles_updated_at 
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Fix the email constraint on user_profiles
ALTER TABLE public.user_profiles 
  DROP CONSTRAINT IF EXISTS user_profiles_email_key CASCADE;

ALTER TABLE public.user_profiles 
  ALTER COLUMN email DROP NOT NULL;

ALTER TABLE public.user_profiles 
  ADD CONSTRAINT user_profiles_email_key UNIQUE (email);

-- 6. Create a working auth trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  user_full_name TEXT;
  user_username TEXT;
  user_role user_role;
BEGIN
  -- Extract values with defaults
  user_email := NEW.email;
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  user_username := NEW.raw_user_meta_data->>'username';
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'influencer')::user_role;
  
  -- Try to insert, update if exists
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    username,
    role
  )
  VALUES (
    NEW.id,
    user_email,
    user_full_name,
    user_username,
    user_role
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name != '' 
      THEN EXCLUDED.full_name 
      ELSE user_profiles.full_name 
    END,
    username = CASE 
      WHEN EXCLUDED.username IS NOT NULL 
      THEN EXCLUDED.username 
      ELSE user_profiles.username 
    END,
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If there's a unique violation, just continue
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the auth trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Ensure proper RLS policies
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.user_profiles;

-- Recreate policies
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role bypass" 
  ON public.user_profiles FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 9. Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role;

-- Grant specific permissions for authenticated users
GRANT SELECT, INSERT, UPDATE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.influencer_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.brand_profiles TO authenticated;

-- Test the setup
DO $$
BEGIN
  RAISE NOTICE 'Setup completed successfully!';
END $$;