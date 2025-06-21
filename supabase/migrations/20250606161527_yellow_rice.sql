/*
  # Savings Goals Table

  1. New Tables
    - `savings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `goal_name` (text, not null)
      - `target_amount` (numeric, not null)
      - `deadline` (date, optional)
      - `current_amount` (numeric, default 0)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `savings` table
    - Add policies for authenticated users to manage their own savings goals
*/

-- Create savings table
CREATE TABLE IF NOT EXISTS savings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name text NOT NULL,
  target_amount numeric(12,2) NOT NULL CHECK (target_amount > 0),
  deadline date,
  current_amount numeric(12,2) DEFAULT 0 CHECK (current_amount >= 0),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS savings_user_id_idx ON savings(user_id);
CREATE INDEX IF NOT EXISTS savings_deadline_idx ON savings(deadline);

-- Enable RLS
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own savings"
  ON savings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own savings"
  ON savings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own savings"
  ON savings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own savings"
  ON savings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_savings_updated_at
  BEFORE UPDATE ON savings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();