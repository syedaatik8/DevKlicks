/*
  # Fix profile creation username uniqueness

  1. Changes
    - Update `handle_new_user()` function to generate unique usernames
    - Append portion of user ID to email prefix to ensure uniqueness
    - Prevent constraint violations during profile creation

  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Create function to handle new user signup with unique username generation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, first_name, last_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'username', 
      split_part(new.email, '@', 1) || '_' || substring(new.id::text, 1, 8)
    ),
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', '')
  );
  RETURN new;
END;
$$ language plpgsql security definer;