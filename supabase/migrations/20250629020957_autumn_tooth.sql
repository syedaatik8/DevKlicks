/*
  # Favicon Generator Feature

  1. New Tables
    - `saved_favicons` - Store user's saved favicon sets
  
  2. Security
    - Enable RLS on saved_favicons table
    - Add policies for authenticated users to manage their own favicons
*/

CREATE TABLE IF NOT EXISTS public.saved_favicons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_image text NOT NULL, -- Base64 encoded original image
  background_color text, -- Hex color code for background (optional)
  sizes jsonb NOT NULL, -- JSON object with size keys and base64 image values
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.saved_favicons ENABLE ROW LEVEL SECURITY;

-- Policies for saved_favicons
CREATE POLICY "Users can read own favicons"
  ON public.saved_favicons
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favicons"
  ON public.saved_favicons
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favicons"
  ON public.saved_favicons
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favicons"
  ON public.saved_favicons
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);