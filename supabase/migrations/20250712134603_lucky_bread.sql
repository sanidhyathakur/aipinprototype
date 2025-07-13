/*
  # Add user interactions and AI models

  1. New Tables
    - `likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `image_id` (uuid, references images)
      - `created_at` (timestamp)
    
    - `comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `image_id` (uuid, references images)
      - `content` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Updates to existing tables
    - Add `ai_model` column to images table
    - Add `like_count` and `comment_count` columns to images table

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users to manage their interactions
    - Add policies for public read access to interactions

  4. Functions
    - Function to update like/comment counts
    - Triggers to maintain counts
*/

-- Add new columns to images table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'ai_model'
  ) THEN
    ALTER TABLE images ADD COLUMN ai_model text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'like_count'
  ) THEN
    ALTER TABLE images ADD COLUMN like_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'images' AND column_name = 'comment_count'
  ) THEN
    ALTER TABLE images ADD COLUMN comment_count integer DEFAULT 0;
  END IF;
END $$;

-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  image_id uuid REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, image_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  image_id uuid REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for likes
CREATE POLICY "Anyone can read likes"
  ON likes
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Anyone can read comments"
  ON comments
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Users can insert own comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update like count
CREATE OR REPLACE FUNCTION update_image_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE images 
    SET like_count = like_count + 1 
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE images 
    SET like_count = like_count - 1 
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update comment count
CREATE OR REPLACE FUNCTION update_image_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE images 
    SET comment_count = comment_count + 1 
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE images 
    SET comment_count = comment_count - 1 
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for like count
DO $$
BEGIN
  DROP TRIGGER IF EXISTS likes_count_trigger ON likes;
  CREATE TRIGGER likes_count_trigger
    AFTER INSERT OR DELETE ON likes
    FOR EACH ROW
    EXECUTE FUNCTION update_image_like_count();
EXCEPTION
  WHEN others THEN null;
END $$;

-- Triggers for comment count
DO $$
BEGIN
  DROP TRIGGER IF EXISTS comments_count_trigger ON comments;
  CREATE TRIGGER comments_count_trigger
    AFTER INSERT OR DELETE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_image_comment_count();
EXCEPTION
  WHEN others THEN null;
END $$;

-- Trigger for comment updated_at
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
  CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN others THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS likes_image_id_idx ON likes(image_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_image_id_idx ON comments(image_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);

-- Initialize counts for existing images
UPDATE images 
SET 
  like_count = COALESCE((SELECT COUNT(*) FROM likes WHERE image_id = images.id), 0),
  comment_count = COALESCE((SELECT COUNT(*) FROM comments WHERE image_id = images.id), 0)
WHERE like_count IS NULL OR comment_count IS NULL;