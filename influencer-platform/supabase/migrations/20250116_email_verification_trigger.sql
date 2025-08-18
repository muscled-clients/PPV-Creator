-- Create a function to activate user on email verification
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  -- When email is confirmed in auth.users, update status to active in user_profiles
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.user_profiles
    SET 
      status = 'active',
      updated_at = NOW()
    WHERE id = NEW.id
    AND status = 'pending';
    
    -- Log the activation
    RAISE NOTICE 'User % email verified and activated', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_email_verified ON auth.users;
CREATE TRIGGER on_email_verified
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
  EXECUTE FUNCTION public.handle_email_verification();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.handle_email_verification() TO service_role;

-- Update the last_sign_in_at when user signs in
CREATE OR REPLACE FUNCTION public.handle_user_signin()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last sign in time
  UPDATE public.user_profiles
  SET last_sign_in_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tracking sign ins
DROP TRIGGER IF EXISTS on_user_signin ON auth.users;
CREATE TRIGGER on_user_signin
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.last_sign_in_at IS NOT NULL AND (OLD.last_sign_in_at IS NULL OR NEW.last_sign_in_at > OLD.last_sign_in_at))
  EXECUTE FUNCTION public.handle_user_signin();

GRANT EXECUTE ON FUNCTION public.handle_user_signin() TO service_role;