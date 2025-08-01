/*
  # Add QR Code Full Size Column

  1. Changes
    - Add `qr_code_full_size` column to existing `qr_codes` table
    - This column will store the full-size QR code data for downloads
    - The existing `qr_code_data` column will be used for 200px previews
*/

-- Add the missing column to the existing table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'qr_codes' AND column_name = 'qr_code_full_size'
  ) THEN
    ALTER TABLE public.qr_codes ADD COLUMN qr_code_full_size text;
  END IF;
END $$;

-- Update existing records to have the same data in both columns initially
-- (Users will need to regenerate QR codes to get proper separation)
UPDATE public.qr_codes 
SET qr_code_full_size = qr_code_data 
WHERE qr_code_full_size IS NULL;

-- Make the column NOT NULL after updating existing records
ALTER TABLE public.qr_codes ALTER COLUMN qr_code_full_size SET NOT NULL;