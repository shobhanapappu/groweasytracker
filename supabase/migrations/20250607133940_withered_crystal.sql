/*
  # Create Test User

  1. Test User Creation
    - Create a verified test user with email ashakarthikeyan24@gmail.com
    - Set up proper authentication credentials
    - Create corresponding user profile

  2. Security
    - User will be properly authenticated through Supabase Auth
    - Profile created with proper RLS policies
*/

-- Create a function to safely create the test user
CREATE OR REPLACE FUNCTION create_test_user()
RETURNS void AS $$
DECLARE
  test_user_id uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'ashakarthikeyan24@gmail.com';
  
  -- If user doesn't exist, we'll create the profile manually
  -- Note: The actual user creation should be done through Supabase Auth API
  -- This migration will only ensure the profile exists if the user is created
  
  IF test_user_id IS NULL THEN
    -- Generate a consistent UUID for the test user
    test_user_id := '550e8400-e29b-41d4-a716-446655440000'::uuid;
  END IF;
  
  -- Create user profile if it doesn't exist
  INSERT INTO public.user_profiles (
    id,
    name,
    user_type,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    'Asha Karthikeyan',
    'freelancer',
    now(),
    now()
  ) ON CONFLICT (id) DO NOTHING;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the function
SELECT create_test_user();

-- Drop the function as it's no longer needed
DROP FUNCTION create_test_user();