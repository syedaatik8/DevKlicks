/*
  # Add avatar_url column to profiles table

  1. Changes
    - Add `avatar_url` column to `profiles` table for storing profile picture URLs
    - Column is optional (nullable) and stores text URLs

  2. Notes
    - This allows users to upload and store profile pictures
    - URLs will typically point to Supabase Storage or external image services
*/

-- Add avatar_url column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;
END $$;