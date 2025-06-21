/*
  # Create budgets table

  1. New Tables
    - `budgets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `category` (text)
      - `budget_limit` (numeric, renamed from 'limit' to avoid SQL keyword conflict)
      - `start_date` (date)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `budgets` table
    - Add policies for authenticated users to manage their own budgets

  3. Performance
    - Add indexes on user_id, category, and start_date for better query performance
    - Add trigger for automatic updated_at timestamp
*/

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  budget_limit numeric(12,2) NOT NULL CHECK (budget_limit > 0),
  start_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_idx ON budgets(category);
CREATE INDEX IF NOT EXISTS budgets_start_date_idx ON budgets(start_date);

-- Enable RLS
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own budgets"
  ON budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets"
  ON budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets"
  ON budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets"
  ON budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();