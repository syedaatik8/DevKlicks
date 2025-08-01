/*
  # Usage Tracking and User Profiles

  1. New Tables
    - `user_usage` - Track daily usage limits for different features
    - `user_profiles` - Extended user profile information including avatar
  
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
  
  3. Functions
    - Function to increment usage counters
    - Function to check usage limits
*/

-- Create user_usage table for tracking feature usage
CREATE TABLE IF NOT EXISTS public.user_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type text NOT NULL,
  usage_date date DEFAULT CURRENT_DATE,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature_type, usage_date)
);

-- Create user_profiles table for extended profile info
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  email text,
  full_name text,
  avatar_url text,
  phone_number text,
  subscription_tier text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_usage
CREATE POLICY "Users can read own usage"
  ON public.user_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.user_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.user_usage
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Function to increment usage (reordered parameters)
CREATE OR REPLACE FUNCTION public.increment_usage(
  p_feature_type text,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  current_usage integer;
BEGIN
  -- Insert or update usage for today
  INSERT INTO public.user_usage (user_id, feature_type, usage_date, usage_count)
  VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET 
    usage_count = user_usage.usage_count + 1,
    updated_at = now();
  
  -- Return current usage count
  SELECT usage_count INTO current_usage
  FROM public.user_usage
  WHERE user_id = p_user_id 
    AND feature_type = p_feature_type 
    AND usage_date = CURRENT_DATE;
  
  RETURN current_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current usage (reordered parameters)
CREATE OR REPLACE FUNCTION public.get_usage(
  p_feature_type text,
  p_user_id uuid
)
RETURNS integer AS $$
DECLARE
  current_usage integer;
BEGIN
  SELECT COALESCE(usage_count, 0) INTO current_usage
  FROM public.user_usage
  WHERE user_id = p_user_id 
    AND feature_type = p_feature_type 
    AND usage_date = CURRENT_DATE;
  
  RETURN COALESCE(current_usage, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to create user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;