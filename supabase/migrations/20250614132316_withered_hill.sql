/*
  # Add cascading deletes for user data cleanup

  1. Changes
    - Ensure all foreign key constraints have CASCADE DELETE
    - This ensures when a user profile is deleted, all related data is automatically removed
    - Covers: income, expenses, investments, savings, budgets, subscriptions

  2. Security
    - Maintains existing RLS policies
    - Only affects data cleanup when user is deleted
*/

-- Ensure all tables have proper CASCADE DELETE constraints
-- (Most are already set, but this ensures consistency)

-- Check and update income table foreign key
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'income_user_id_fkey' 
    AND table_name = 'income'
  ) THEN
    ALTER TABLE income DROP CONSTRAINT income_user_id_fkey;
  END IF;
  
  -- Add constraint with CASCADE DELETE
  ALTER TABLE income ADD CONSTRAINT income_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Check and update expenses table foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'expenses_user_id_fkey' 
    AND table_name = 'expenses'
  ) THEN
    ALTER TABLE expenses DROP CONSTRAINT expenses_user_id_fkey;
  END IF;
  
  ALTER TABLE expenses ADD CONSTRAINT expenses_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Check and update investments table foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'investments_user_id_fkey' 
    AND table_name = 'investments'
  ) THEN
    ALTER TABLE investments DROP CONSTRAINT investments_user_id_fkey;
  END IF;
  
  ALTER TABLE investments ADD CONSTRAINT investments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Check and update savings table foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'savings_user_id_fkey' 
    AND table_name = 'savings'
  ) THEN
    ALTER TABLE savings DROP CONSTRAINT savings_user_id_fkey;
  END IF;
  
  ALTER TABLE savings ADD CONSTRAINT savings_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Check and update budgets table foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'budgets_user_id_fkey' 
    AND table_name = 'budgets'
  ) THEN
    ALTER TABLE budgets DROP CONSTRAINT budgets_user_id_fkey;
  END IF;
  
  ALTER TABLE budgets ADD CONSTRAINT budgets_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Check and update subscriptions table foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'subscriptions_user_id_fkey' 
    AND table_name = 'subscriptions'
  ) THEN
    ALTER TABLE subscriptions DROP CONSTRAINT subscriptions_user_id_fkey;
  END IF;
  
  ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Check and update user_profiles table foreign key
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_id_fkey' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_id_fkey;
  END IF;
  
  ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;