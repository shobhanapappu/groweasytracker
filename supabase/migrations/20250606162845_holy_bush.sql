/*
  # Fix user signup trigger

  1. Trigger Function
    - Recreate the `handle_new_user` function to properly handle user metadata
    - Extract name and user_type from raw_user_meta_data
    - Insert into user_profiles table

  2. Trigger
    - Create trigger on auth.users table to call function after insert
    - Ensure new users get profile records created automatically

  3. Security
    - Function runs with SECURITY DEFINER to bypass RLS during creation
*/

-- Recreate the trigger function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'freelancer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create user profiles
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();