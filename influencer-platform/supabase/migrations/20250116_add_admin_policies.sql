-- Add policies for admin users to manage all user profiles

-- Drop existing update policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.user_profiles;

-- Create new update policies
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Admins can update all profiles" ON public.user_profiles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Add delete policy for admins
DROP POLICY IF EXISTS "Admins can delete any profile" ON public.user_profiles;
CREATE POLICY "Admins can delete any profile" ON public.user_profiles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Add policy for admins to view all detailed user data
DROP POLICY IF EXISTS "Admins can view all profiles with details" ON public.user_profiles;
CREATE POLICY "Admins can view all profiles with details" ON public.user_profiles
  FOR SELECT
  USING (
    true -- Everyone can view profiles, but admins get full access through the app logic
  );

-- Grant necessary permissions
GRANT ALL ON public.user_profiles TO authenticated;