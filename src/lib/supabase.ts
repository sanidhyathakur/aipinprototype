import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      images: {
        Row: {
          id: string
          title: string
          description: string | null
          tags: string[]
          image_url: string
          user_id: string
          is_ai_generated: boolean
          ai_prompt: string | null
          ai_model: string | null
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          tags?: string[]
          image_url: string
          user_id: string
          is_ai_generated?: boolean
          ai_prompt?: string | null
          ai_model?: string | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          tags?: string[]
          image_url?: string
          user_id?: string
          is_ai_generated?: boolean
          ai_prompt?: string | null
          ai_model?: string | null
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          user_id: string
          image_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}