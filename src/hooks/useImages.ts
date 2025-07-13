import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/supabase'

type Image = Database['public']['Tables']['images']['Row']

interface UploadImageParams {
  file: File
  title: string
  description?: string
  tags: string[]
  userId: string
  isAIGenerated?: boolean
  aiPrompt?: string
  aiModel?: string
}

interface GenerateImageParams {
  prompt: string
  title: string
  description?: string
  tags: string[]
  userId: string
  imageUrl: string
  model: string
}

export function useImages() {
  const [images, setImages] = useState<Image[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecentImages = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching images:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchUserImages = useCallback(async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching user images:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAllImages = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setImages(data || [])
    } catch (error) {
      console.error('Error fetching all images:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadImage = useCallback(async ({ 
    file, 
    title, 
    description, 
    tags, 
    userId, 
    isAIGenerated = false, 
    aiPrompt, 
    aiModel 
  }: UploadImageParams) => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `uploads/${userId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      const { data, error: dbError } = await supabase
        .from('images')
        .insert({
          title,
          description,
          tags: tags as unknown as string[],
          image_url: publicUrl,
          user_id: userId,
          is_ai_generated: isAIGenerated,
          ai_prompt: aiPrompt,
          ai_model: aiModel
        })
        .select()

      if (dbError) throw dbError

      setImages(prev => [data[0], ...prev])
      return data[0]
    } catch (error) {
      console.error('Error uploading image:', error)
      throw error
    }
  }, [])

  const fetchImageAsFile = useCallback(async (imageUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const ext = blob.type.split('/')[1] || 'png'
    return new File([blob], `${fileName}.${ext}`, { type: blob.type })
  }, [])

  const generateAIImage = useCallback(async ({ prompt, title, description, tags, userId, imageUrl, model }: GenerateImageParams) => {
    try {
      // Create a unique filename to prevent duplicates
      const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const fileName = `ai_generated_${uniqueId}`
      const file = await fetchImageAsFile(imageUrl, fileName)
      
      // Use the uploadImage function with AI-specific parameters
      const uploadedImage = await uploadImage({
        file,
        title,
        description,
        tags,
        userId,
        isAIGenerated: true,
        aiPrompt: prompt,
        aiModel: model
      })

      return uploadedImage
    } catch (error) {
      console.error('Error saving AI image:', error)
      throw error
    }
  }, [fetchImageAsFile, uploadImage])

  return {
    images,
    loading,
    fetchRecentImages,
    fetchUserImages,
    fetchAllImages,
    uploadImage,
    generateAIImage
  }
}