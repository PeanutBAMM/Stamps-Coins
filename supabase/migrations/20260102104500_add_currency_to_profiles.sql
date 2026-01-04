-- Add currency column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'EUR';
