/*
  # Update trial end date to June 21, 2025

  1. Changes
    - Update the handle_new_user function to set trial_end_date to June 21, 2025
    - This affects new user signups going forward
    - Existing users will need manual updates if needed

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS during creation
*/

-- Update the handle_new_user function to set trial end date to June 21, 2025
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
  
  -- Insert subscription with trial ending June 21, 2025
  INSERT INTO public.subscriptions (user_id, plan, trial_end_date, status)
  VALUES (
    NEW.id,
    'free',
    '2025-06-21 23:59:59+00'::timestamptz,
    'active'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;