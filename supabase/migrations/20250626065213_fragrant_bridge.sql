/*
  # Create images and user profiles tables

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `images`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, optional)
      - `tags` (text array)
      - `image_url` (text, required)
      - `user_id` (uuid, references user_profiles)
      - `is_ai_generated` (boolean, default false)
      - `ai_prompt` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read their own data
    - Add policies for public read access to images
    - Add policies for users to insert their own data

  3. Storage
    - Create storage bucket for images
    - Set up RLS policies for storage bucket
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create images table
CREATE TABLE IF NOT EXISTS images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  image_url text NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  is_ai_generated boolean DEFAULT false,
  ai_prompt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for images
CREATE POLICY "Anyone can read images"
  ON images
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own images"
  ON images
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images"
  ON images
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own images"
  ON images
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for images
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('images', 'images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies
CREATE POLICY "Anyone can view images"
  ON storage.objects
  FOR SELECT
  TO authenticated, anon
  USING (bucket_id = 'images');

CREATE POLICY "Users can upload images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = 'uploads' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can update own images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = 'uploads' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Users can delete own images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'images' AND
    (storage.foldername(name))[1] = 'uploads' AND
    (storage.foldername(name))[2] = auth.uid()::text
  );

-- Function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
EXCEPTION
  WHEN others THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS images_user_id_idx ON images(user_id);
CREATE INDEX IF NOT EXISTS images_created_at_idx ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS images_is_ai_generated_idx ON images(is_ai_generated);
CREATE INDEX IF NOT EXISTS images_tags_idx ON images USING gin(tags);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_images_updated_at ON images;
  CREATE TRIGGER update_images_updated_at
    BEFORE UPDATE ON images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
    
  DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
  CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN others THEN null;
END $$;