/*
  # Investments Tracking Table

  1. New Tables
    - `investments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text, not null - e.g., stock, bond, crypto)
      - `amount` (numeric, not null)
      - `date` (date, not null)
      - `platform` (text, not null)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `investments` table
    - Add policies for authenticated users to manage their own investment records
*/

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  date date NOT NULL,
  platform text NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS investments_user_id_idx ON investments(user_id);
CREATE INDEX IF NOT EXISTS investments_date_idx ON investments(date);
CREATE INDEX IF NOT EXISTS investments_type_idx ON investments(type);

-- Enable RLS
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own investments"
  ON investments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
  ON investments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
  ON investments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
  ON investments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER handle_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();