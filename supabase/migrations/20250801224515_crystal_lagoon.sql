/*
  # Payment Structure for DevKlicks

  1. New Tables
    - `user_purchases` - Track user purchases and payment status
    - `payment_transactions` - Store payment transaction details
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to view their own data
  
  3. Changes
    - Update user_profiles to include purchase information
*/

-- Create user_purchases table
CREATE TABLE IF NOT EXISTS public.user_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_type text NOT NULL, -- 'base_features', 'lifetime_updates', 'complete_package'
  amount_paid decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_status text DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_method text, -- 'paypal', 'credit_card'
  paypal_transaction_id text,
  includes_lifetime_updates boolean DEFAULT false,
  purchase_date timestamptz DEFAULT now(),
  activated_at timestamptz,
  expires_at timestamptz, -- NULL for lifetime purchases
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_transactions table for detailed transaction logging
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  purchase_id uuid REFERENCES public.user_purchases(id) ON DELETE CASCADE,
  transaction_id text NOT NULL, -- PayPal transaction ID
  payment_method text NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  status text NOT NULL, -- 'pending', 'completed', 'failed', 'cancelled', 'refunded'
  gateway_response jsonb, -- Store full gateway response
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add purchase-related columns to user_profiles
DO $$
BEGIN
  -- Add has_premium_access column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'has_premium_access'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN has_premium_access boolean DEFAULT false;
  END IF;

  -- Add has_lifetime_updates column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'has_lifetime_updates'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN has_lifetime_updates boolean DEFAULT false;
  END IF;

  -- Add premium_activated_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'premium_activated_at'
  ) THEN
    ALTER TABLE public.user_profiles ADD COLUMN premium_activated_at timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_purchases
CREATE POLICY "Users can read own purchases"
  ON public.user_purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON public.user_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases"
  ON public.user_purchases
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for payment_transactions
CREATE POLICY "Users can read own transactions"
  ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to activate premium access after successful payment
CREATE OR REPLACE FUNCTION public.activate_premium_access(
  p_user_id uuid,
  p_purchase_id uuid,
  p_includes_lifetime_updates boolean DEFAULT false
)
RETURNS boolean AS $$
BEGIN
  -- Update user_profiles
  UPDATE public.user_profiles
  SET 
    has_premium_access = true,
    has_lifetime_updates = p_includes_lifetime_updates,
    premium_activated_at = now(),
    subscription_tier = 'premium',
    updated_at = now()
  WHERE id = p_user_id;

  -- Update purchase record
  UPDATE public.user_purchases
  SET 
    payment_status = 'completed',
    activated_at = now(),
    updated_at = now()
  WHERE id = p_purchase_id AND user_id = p_user_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has premium access
CREATE OR REPLACE FUNCTION public.check_premium_access(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  has_access boolean;
BEGIN
  SELECT has_premium_access INTO has_access
  FROM public.user_profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user purchase details
CREATE OR REPLACE FUNCTION public.get_user_purchase_info(p_user_id uuid)
RETURNS TABLE(
  has_premium boolean,
  has_lifetime_updates boolean,
  activated_at timestamptz,
  total_spent decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.has_premium_access,
    up.has_lifetime_updates,
    up.premium_activated_at,
    COALESCE(SUM(pur.amount_paid), 0) as total_spent
  FROM public.user_profiles up
  LEFT JOIN public.user_purchases pur ON pur.user_id = up.id AND pur.payment_status = 'completed'
  WHERE up.id = p_user_id
  GROUP BY up.has_premium_access, up.has_lifetime_updates, up.premium_activated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;