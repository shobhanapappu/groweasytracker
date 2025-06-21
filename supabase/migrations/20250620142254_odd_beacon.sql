/*
  # Fix 7-day trial period logic

  1. Changes
    - Update the handle_new_user function to set trial_end_date to 7 days from signup
    - This ensures every user gets exactly 7 days of trial regardless of signup date
    - Update existing users to have proper 7-day trial from their signup date

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS during creation
*/

-- Update the handle_new_user function to set trial end date to 7 days from signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user profile
  INSERT INTO public.user_profiles (id, name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'freelancer')
  );
  
  -- Insert subscription with 7-day trial from signup date
  INSERT INTO public.subscriptions (user_id, plan, trial_end_date, status)
  VALUES (
    NEW.id,
    'free',
    (NEW.created_at + INTERVAL '7 days'),
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing subscriptions to have proper 7-day trial from user creation date
-- This will fix any existing users who might have incorrect trial dates
UPDATE subscriptions 
SET trial_end_date = (
  SELECT auth.users.created_at + INTERVAL '7 days'
  FROM auth.users 
  WHERE auth.users.id = subscriptions.user_id
)
WHERE plan = 'free' AND trial_end_date IS NOT NULL;