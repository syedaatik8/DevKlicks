/*
  # QR Code Generator Feature

  1. New Tables
    - `qr_codes` - Store user's saved QR codes
  
  2. Security
    - Enable RLS on qr_codes table
    - Add policies for authenticated users to manage their own QR codes
*/

CREATE TABLE IF NOT EXISTS public.qr_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  format text NOT NULL, -- 'png', 'jpeg', 'svg'
  size integer NOT NULL, -- 200, 500, 1000
  qr_code_data text NOT NULL, -- Base64 encoded QR code or SVG string
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

-- Policies for qr_codes
CREATE POLICY "Users can read own qr codes"
  ON public.qr_codes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own qr codes"
  ON public.qr_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own qr codes"
  ON public.qr_codes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own qr codes"
  ON public.qr_codes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update specific user to premium (syedaatik8@gmail.com)
UPDATE public.user_profiles 
SET subscription_tier = 'premium' 
WHERE email = 'syedaatik8@gmail.com';