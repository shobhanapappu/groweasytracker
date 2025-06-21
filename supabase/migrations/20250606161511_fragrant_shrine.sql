/*
  # Income Tracking Table

  1. New Tables
    - `income`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `amount` (numeric, not null)
      - `source` (text, not null)
      - `date` (date, not null)
      - `category` (text, not null)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `income` table
    - Add policies for authenticated users to manage their own income records
*/

-- Create income table
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  source text NOT NULL,
  date date NOT NULL,
  category text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS income_user_id_idx ON income(user_id);
CREATE INDEX IF NOT EXISTS income_date_idx ON income(date);
CREATE INDEX IF NOT EXISTS income_category_idx ON income(category);

-- Enable RLS
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own income"
  ON income
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
  ON income
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
  ON income
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
  ON income
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_income_updated_at
  BEFORE UPDATE ON income
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();