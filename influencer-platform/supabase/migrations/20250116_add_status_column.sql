-- Add status column to user_profiles table

-- First check if the column already exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'status'
  ) THEN
    -- Add the status column with a default value
    ALTER TABLE public.user_profiles 
    ADD COLUMN status TEXT DEFAULT 'active' 
    CHECK (status IN ('active', 'suspended', 'pending'));
    
    -- Update existing records to have 'active' status
    UPDATE public.user_profiles 
    SET status = 'active' 
    WHERE status IS NULL;
    
    -- Make the column NOT NULL after setting default values
    ALTER TABLE public.user_profiles 
    ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- Also add last_sign_in_at column if it doesn't exist (for tracking user activity)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_profiles' 
    AND column_name = 'last_sign_in_at'
  ) THEN
    ALTER TABLE public.user_profiles 
    ADD COLUMN last_sign_in_at TIMESTAMPTZ;
  END IF;
END $$;

-- Create an index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON public.user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_status ON public.user_profiles(role, status);