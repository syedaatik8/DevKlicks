/*
  # Background Removal Feature

  1. New Tables
    - `background_removed_images` - Store user's processed images with background removed
  
  2. Security
    - Enable RLS on background_removed_images table
    - Add policies for authenticated users to manage their own processed images
*/

CREATE TABLE IF NOT EXISTS public.background_removed_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  original_url text NOT NULL, -- Base64 encoded original image
  processed_url text NOT NULL, -- Base64 encoded processed image with background removed
  original_size jsonb NOT NULL, -- JSON object with width and height
  processed_size jsonb NOT NULL, -- JSON object with width and height
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_removed_images ENABLE ROW LEVEL SECURITY;

-- Policies for background_removed_images
CREATE POLICY "Users can read own processed images"
  ON public.background_removed_images
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own processed images"
  ON public.background_removed_images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own processed images"
  ON public.background_removed_images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own processed images"
  ON public.background_removed_images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);