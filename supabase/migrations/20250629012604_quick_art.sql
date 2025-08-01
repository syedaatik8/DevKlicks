/*
  # Color Palettes Feature

  1. New Tables
    - `color_palettes` - Store user's saved color palettes
  
  2. Security
    - Enable RLS on color_palettes table
    - Add policies for authenticated users to manage their own palettes
*/

CREATE TABLE IF NOT EXISTS public.color_palettes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  colors text[] NOT NULL, -- Array of hex color codes
  source_type text NOT NULL, -- 'manual', 'logo', 'random'
  source_data text, -- Optional: stores additional info like logo URL or random type
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.color_palettes ENABLE ROW LEVEL SECURITY;

-- Policies for color_palettes
CREATE POLICY "Users can read own palettes"
  ON public.color_palettes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own palettes"
  ON public.color_palettes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own palettes"
  ON public.color_palettes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own palettes"
  ON public.color_palettes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);