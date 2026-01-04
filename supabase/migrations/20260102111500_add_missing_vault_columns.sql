-- Create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add missing columns to vaults table
ALTER TABLE vaults 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS type text DEFAULT 'Mixed',
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Update existing rows to have a default type if they are null
UPDATE vaults SET type = 'Mixed' WHERE type IS NULL;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS set_vaults_updated_at ON vaults;
CREATE TRIGGER set_vaults_updated_at
BEFORE UPDATE ON vaults
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();
