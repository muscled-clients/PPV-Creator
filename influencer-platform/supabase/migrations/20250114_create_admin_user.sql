-- Create Admin User Migration
-- 
-- Instructions:
-- 1. First create a user account through Supabase Auth dashboard or using the registration form
-- 2. Note the user's UUID from the auth.users table
-- 3. Replace 'YOUR_USER_ID_HERE' with the actual user ID
-- 4. Run this migration to convert the user to admin

-- Update existing user to admin role
UPDATE user_profiles 
SET 
  role = 'admin',
  updated_at = NOW()
WHERE id = 'YOUR_USER_ID_HERE';

-- Alternative: Create admin directly (if you know the user details)
-- This assumes you've already created the user in Supabase Auth
/*
INSERT INTO user_profiles (
  id,
  email,
  full_name,
  username,
  role,
  created_at,
  updated_at
) VALUES (
  'YOUR_USER_ID_HERE', -- Must match auth.users id
  'admin@example.com',
  'Admin User',
  'admin',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) 
DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();
*/

-- Grant admin specific permissions if needed
-- Example: Allow admin to read all tables
/*
CREATE POLICY "Admins can read all data" ON campaigns
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
*/