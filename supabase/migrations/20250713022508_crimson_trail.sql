/*
  # Add username field to user profiles

  1. Changes
    - Add username column to user_profiles table
    - Add unique constraint on username
    - Update handle_new_user function to include username
    - Add index for username lookups

  2. Security
    - Maintain existing RLS policies
    - Username is publicly readable but only user can update their own
*/

-- Add username column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'username'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN username text;
  END IF;
END $$;

-- Add unique constraint on username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'user_profiles' AND constraint_name = 'user_profiles_username_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
  END IF;
END $$;

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS user_profiles_username_idx ON user_profiles(username);

-- Update the handle_new_user function to include username
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, username)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;