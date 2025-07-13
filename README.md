# AiPin - Your Creative Board

A full-stack Pinterest-style AI image gallery web app built with React, Vite, and Supabase.

## 🌟 Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Image Upload**: Upload images with titles, descriptions, and tags
- **AI Image Generation**: Generate images using multiple AI models
- **Social Interactions**: Like and comment on images
- **Responsive Design**: Beautiful masonry layout that works on all devices
- **Real-time Updates**: Live like/comment counts and interactions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aipin-creative-board
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase** (see detailed instructions below)

4. **Configure environment variables**
   ```bash
   # Create .env file
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 🗄️ Supabase Setup

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be ready
4. Go to Settings > API to get your project URL and anon key

### Step 2: Database Setup

Execute the following SQL commands in your Supabase SQL Editor:

#### Create User Profiles Table

```sql
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
```

#### Create Images Table

```sql
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
  ai_model text,
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE images ENABLE ROW LEVEL SECURITY;

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
```

#### Create Likes Table

```sql
-- Create likes table
CREATE TABLE IF NOT EXISTS likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  image_id uuid REFERENCES images(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, image_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

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
```

#### Create Comments Table

```sql
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
```

#### Create Storage Bucket

```sql
-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

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
```

#### Create Functions and Triggers

```sql
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for like count
DROP TRIGGER IF EXISTS likes_count_trigger ON likes;
CREATE TRIGGER likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION update_image_like_count();

-- Triggers for comment count
DROP TRIGGER IF EXISTS comments_count_trigger ON comments;
CREATE TRIGGER comments_count_trigger
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_image_comment_count();

-- Triggers for updated_at
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

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Create Indexes

```sql
-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS images_user_id_idx ON images(user_id);
CREATE INDEX IF NOT EXISTS images_created_at_idx ON images(created_at DESC);
CREATE INDEX IF NOT EXISTS images_is_ai_generated_idx ON images(is_ai_generated);
CREATE INDEX IF NOT EXISTS images_tags_idx ON images USING gin(tags);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);
CREATE INDEX IF NOT EXISTS likes_image_id_idx ON likes(image_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);
CREATE INDEX IF NOT EXISTS comments_image_id_idx ON comments(image_id);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON comments(created_at DESC);
```

### Step 3: Configure Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Disable email confirmation for development (optional)
4. Configure any additional auth providers if needed

## 🤖 AI Model Integration

### Current Models

The app currently supports 5 AI models with simulated generation:

1. **DALL-E 3** - Highest quality, slower generation
2. **DALL-E 2** - Balanced quality and speed
3. **Midjourney** - Artistic and creative results
4. **Stable Diffusion** - Fast generation
5. **Leonardo AI** - Detailed artwork specialist

### Adding Real AI API Integration

To integrate real AI APIs, modify the `handleGenerate` function in `src/components/Upload/AIGenerateForm.tsx`:

#### OpenAI DALL-E Integration

```javascript
// Add to your .env file
VITE_OPENAI_API_KEY=your_openai_api_key

// Update handleGenerate function
const handleGenerate = async () => {
  if (!formData.prompt || !user) return

  setLoading(true)
  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: formData.model === 'dall-e-3' ? 'dall-e-3' : 'dall-e-2',
        prompt: formData.prompt,
        n: 1,
        size: '1024x1024',
        quality: formData.model === 'dall-e-3' ? 'hd' : 'standard',
        style: formData.style === 'artistic' ? 'vivid' : 'natural'
      }),
    })

    const data = await response.json()
    if (data.data && data.data[0]) {
      setGeneratedImage(data.data[0].url)
    }
  } catch (error) {
    console.error('Generation error:', error)
  } finally {
    setLoading(false)
  }
}
```

#### Stability AI Integration

```javascript
// Add to your .env file
VITE_STABILITY_API_KEY=your_stability_api_key

// For Stable Diffusion
const generateWithStability = async (prompt) => {
  const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text_prompts: [{ text: prompt }],
      cfg_scale: 7,
      height: 1024,
      width: 1024,
      steps: 30,
      samples: 1,
    }),
  })

  const data = await response.json()
  return data.artifacts[0].base64 // Convert base64 to image URL
}
```

#### Adding New Models

To add a new AI model:

1. **Update the models array** in `AIGenerateForm.tsx`:

```javascript
const models = [
  // ... existing models
  {
    value: 'your-new-model',
    label: 'Your New Model',
    icon: YourIcon,
    description: 'Description of your model',
    speed: 'Fast/Medium/Slow',
    quality: 'Good/Very Good/Excellent'
  }
]
```

2. **Add API integration** in the `handleGenerate` function:

```javascript
const handleGenerate = async () => {
  // ... existing code

  let imageUrl;
  switch (formData.model) {
    case 'your-new-model':
      imageUrl = await generateWithYourAPI(formData.prompt)
      break
    // ... other cases
  }

  setGeneratedImage(imageUrl)
}
```

3. **Create the API function**:

```javascript
const generateWithYourAPI = async (prompt) => {
  const response = await fetch('your-api-endpoint', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_YOUR_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: prompt,
      // ... other parameters
    }),
  })

  const data = await response.json()
  return data.image_url // Return the generated image URL
}
```

### Environment Variables for AI APIs

Create a `.env` file with your API keys:

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI APIs (add as needed)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_STABILITY_API_KEY=your_stability_api_key
VITE_MIDJOURNEY_API_KEY=your_midjourney_api_key
VITE_LEONARDO_API_KEY=your_leonardo_api_key
```

## 📱 Usage

1. **Sign Up/Login**: Create an account or login with existing credentials
2. **Upload Images**: Go to the Upload tab to add your own images
3. **Generate AI Images**: Use the AI Generate tab to create images from prompts
4. **Explore**: Browse all public images in the Explore section
5. **Interact**: Like and comment on images you enjoy
6. **Manage**: View your collection in My Gallery

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (Auth, Database, Storage)
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage

## 📂 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   └── AuthForm.tsx
│   ├── Gallery/
│   │   ├── ImageCard.tsx
│   │   ├── ImageModal.tsx
│   │   └── MasonryGrid.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── Layout.tsx
│   └── Upload/
│       ├── AIGenerateForm.tsx
│       └── UploadForm.tsx
├── contexts/
│   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useImages.ts
│   └── useInteractions.ts
├── lib/
│   └── supabase.ts
├── pages/
│   ├── Explore.tsx
│   ├── Generated.tsx
│   ├── Home.tsx
│   ├── MyGallery.tsx
│   └── Upload.tsx
└── App.tsx
```

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Netlify Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Configure environment variables
4. Set up redirects for SPA routing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🆘 Support

If you encounter any issues:

1. Check the Supabase dashboard for database errors
2. Verify environment variables are set correctly
3. Check browser console for JavaScript errors
4. Ensure all SQL commands were executed successfully

For additional help, please open an issue in the repository.# aipinprototype
