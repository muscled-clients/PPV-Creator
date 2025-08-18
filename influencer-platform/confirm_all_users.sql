-- Manually confirm all existing users for testing
-- This bypasses email confirmation requirement

-- Update all unconfirmed users to confirmed
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW(),
  updated_at = NOW()
WHERE 
  email_confirmed_at IS NULL;

-- Check the results
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;

DO $$
DECLARE
  confirmed_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO confirmed_count
  FROM auth.users
  WHERE email_confirmed_at IS NOT NULL;
  
  RAISE NOTICE 'Total confirmed users: %', confirmed_count;
END $$;