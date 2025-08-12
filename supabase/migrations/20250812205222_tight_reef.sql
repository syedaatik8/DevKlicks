/*
  # Fix signup database error - ensure unique username generation

  1. Changes
    - Drop and recreate the `handle_new_user()` function with robust username generation
    - Add error handling to prevent signup failures
    - Ensure usernames are always unique by using UUID suffix
    - Properly handle trigger dependencies

  2. Security
    - Maintains existing RLS policies
    - No changes to security model

  3. Notes
    - This migration ensures that user signup will not fail due to username conflicts
    - Uses a combination of email prefix and UUID to guarantee uniqueness
*/

-- Drop existing trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop existing function
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function to handle new user signup with guaranteed unique username
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  base_username text;
  final_username text;
BEGIN
  -- Generate base username from email
  base_username := split_part(new.email, '@', 1);
  
  -- Create unique username using UUID suffix to guarantee uniqueness
  final_username := base_username || '_' || substring(new.id::text, 1, 8);
  
  -- Insert profile with error handling
  BEGIN
    INSERT INTO public.profiles (id, email, username, first_name, last_name)
    VALUES (
      new.id,
      new.email,
      final_username,
      COALESCE(new.raw_user_meta_data->>'first_name', ''),
      COALESCE(new.raw_user_meta_data->>'last_name', '')
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- If somehow still not unique, use full UUID without dashes
      final_username := base_username || '_' || replace(new.id::text, '-', '');
      INSERT INTO public.profiles (id, email, username, first_name, last_name)
      VALUES (
        new.id,
        new.email,
        final_username,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', '')
      );
  END;
  
  RETURN new;
END;
$$ language plpgsql security definer;

-- Recreate trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();