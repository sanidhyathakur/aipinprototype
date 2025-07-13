import React, { useState } from 'react'
import axios from 'axios'
import { Sparkles, Wand2, Palette, Camera, Zap, Brain, Image as ImageIcon } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useImages } from '../../hooks/useImages'

const models = [
  {
    label: 'Pollinations - Free Unlimited',
    value: 'pollinations-default',
    description: 'High quality images with no limits',
    quality: 'High',
    speed: 'Fast',
    icon: ImageIcon,
    isPollinations: true
  },
  {
    label: 'Pollinations - Flux',
    value: 'pollinations-flux',
    description: 'Fast general purpose generations',
    quality: 'High',
    speed: 'Very Fast',
    icon: Sparkles,
    isPollinations: true
  },
  {
    label: 'Pollinations - GPTImage',
    value: 'pollinations-gptimage',
    description: 'Advanced prompt understanding',
    quality: 'Excellent',
    speed: 'Medium',
    icon: Brain,
    isPollinations: true
  },
  {
    label: 'Pollinations - Kontext',
    value: 'pollinations-kontext',
    description: 'Context-aware generations',
    quality: 'Very High',
    speed: 'Medium',
    icon: Wand2,
    isPollinations: true
  },
  {
    label: 'Free Stream',
    value: 'ai-image-generator-free',
    description: 'Photorealistic fantasy & nature',
    quality: 'High',
    speed: 'Fast',
    icon: Palette
  },
  {
    label: 'Flux Poster',
    value: 'flux-gaming-poster',
    description: 'Poster + neon warrior aesthetics',
    quality: 'Medium',
    speed: 'Medium',
    icon: Zap
  },
  {
    label: 'OmniInfer Anime',
    value: 'omniinfer-meina',
    description: 'Anime studio-quality art',
    quality: 'Very High',
    speed: 'Medium',
    icon: Palette
  },
  {
    label: 'DALL·E 3 (Rapid)',
    value: 'dall-e-34',
    description: 'DALL·E 3, official via RapidAPI',
    quality: 'Excellent',
    speed: 'Slow',
    icon: Brain
  },
  {
    label: 'Flux Alt',
    value: 'flux-alt-api',
    description: 'Alternate flux model',
    quality: 'Good',
    speed: 'Medium',
    icon: Wand2
  },
  {
    label: 'Gen Imager',
    value: 'gen-imager',
    description: 'Simple, ultra-light API',
    quality: 'Low',
    speed: 'Fast',
    icon: Camera
  }
]

const generateWithPollinations = async (prompt, options = {}) => {
  const {
    model = 'flux',
    width = 1024,
    height = 1024,
    enhance = false,
    nologo = false,
    privateImage = false,
    safe = false,
    transparent = false
  } = options

  const baseUrl = 'https://image.pollinations.ai/prompt/'
  const encodedPrompt = encodeURIComponent(prompt)
  let url = `${baseUrl}${encodedPrompt}?model=${model}`

  // Add optional parameters
  if (width) url += `&width=${width}`
  if (height) url += `&height=${height}`
  if (enhance) url += `&enhance=true`
  if (nologo) url += `&nologo=true`
  if (privateImage) url += `&private=true`
  if (safe) url += `&safe=true`
  if (transparent) url += `&transparent=true`

  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Image generation failed')
    return await response.blob()
  } catch (error) {
    console.error('Pollinations.ai API error:', error)
    throw error
  }
}

export default function AIGenerateForm() {
  const { user } = useAuthContext()
  const { generateAIImage, uploadImage } = useImages()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [imageBlob, setImageBlob] = useState(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [formData, setFormData] = useState({
    prompt: '',
    negativePrompt: '',
    model: models[0].value,
    title: '',
    description: '',
    tags: ''
  })

  const generateImage = async () => {
    if (!formData.prompt) {
      setError('Please enter a prompt')
      return
    }
    
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      let blob

      // Handle Pollinations models
      if (formData.model.startsWith('pollinations-')) {
        const pollinationsModel = formData.model.replace('pollinations-', '')
        blob = await generateWithPollinations(formData.prompt, {
          model: pollinationsModel === 'default' ? 'flux' : pollinationsModel,
          width: 1024,
          height: 1024,
          enhance: false
        })
      } 
      // Handle other models
      else {
        const headers = {
          'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
          'Content-Type': 'application/json'
        }
        let res, url

        switch (formData.model) {
          case 'ai-image-generator-free':
            res = await axios.post(
              'https://ai-image-generator-free.p.rapidapi.com/generate/stream',
              {
                prompt: formData.prompt,
                negativePrompt: formData.negativePrompt,
                guidancescale: 7.5,
                style: '(No style)'
              },
              {
                headers: {
                  ...headers,
                  'x-rapidapi-host': 'ai-image-generator-free.p.rapidapi.com'
                },
                responseType: 'blob'
              }
            )
            blob = res.data
            break

          case 'omniinfer-meina':
            res = await axios.post(
              'https://omniinfer.p.rapidapi.com/v2/txt2img',
              {
                prompt: formData.prompt,
                negative_prompt: formData.negativePrompt,
                sampler_name: 'Euler a',
                batch_size: 1,
                n_iter: 1,
                steps: 20,
                cfg_scale: 7,
                seed: -1,
                height: 1024,
                width: 768,
                model_name: 'meinamix_meinaV9.safetensors'
              },
              {
                headers: {
                  ...headers,
                  'x-rapidapi-host': 'omniinfer.p.rapidapi.com'
                },
                responseType: 'blob'
              }
            )
            blob = res.data
            break

          case 'dall-e-34':
            res = await axios.post(
              'https://dall-e-34.p.rapidapi.com/v1/images/generations',
              {
                prompt: formData.prompt,
                model: 'dall-e-3',
                n: 1,
                size: '1024x1024',
                quality: 'standard'
              },
              {
                headers: {
                  ...headers,
                  'x-rapidapi-host': 'dall-e-34.p.rapidapi.com'
                }
              }
            )
            url = res?.data?.data?.[0]?.url
            if (!url) throw new Error('No image URL returned from API')
            const imageResponse = await fetch(url)
            blob = await imageResponse.blob()
            break

          case 'flux-gaming-poster':
            res = await axios.post(
              'https://ai-text-to-image-generator-flux-free-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php',
              {
                prompt: formData.prompt,
                style_id: 27,
                size: '16-9'
              },
              {
                headers: {
                  ...headers,
                  'x-rapidapi-host': 'ai-text-to-image-generator-flux-free-api.p.rapidapi.com'
                }
              }
            )
            url = res?.data?.url || res?.data?.image || res?.data?.output
            if (!url) throw new Error('No image URL returned from API')
            const fluxResponse = await fetch(url)
            blob = await fluxResponse.blob()
            break

          case 'flux-alt-api':
            res = await axios.post(
              'https://ai-text-to-image-generator-flux-free-api-api.p.rapidapi.com/aaaaaaaaaaaaaaaaaiimagegenerator/quick.php',
              {
                prompt: formData.prompt,
                style_id: 2,
                size: '1-1'
              },
              {
                headers: {
                  ...headers,
                  'x-rapidapi-host': 'ai-text-to-image-generator-flux-free-api-api.p.rapidapi.com'
                }
              }
            )
            url = res?.data?.url || res?.data?.image || res?.data?.output
            if (!url) throw new Error('No image URL returned from API')
            const altFluxResponse = await fetch(url)
            blob = await altFluxResponse.blob()
            break

          case 'gen-imager':
            const form = new FormData()
            form.append('prompt', formData.prompt)
            res = await axios.post(
              'https://gen-imager.p.rapidapi.com/genimager/index.php',
              form,
              {
                headers: {
                  'x-rapidapi-key': import.meta.env.VITE_RAPIDAPI_KEY,
                  'x-rapidapi-host': 'gen-imager.p.rapidapi.com'
                }
              }
            )
            url = res?.data?.url || res?.data?.image || res?.data?.output
            if (!url) throw new Error('No image URL returned from API')
            const genImagerResponse = await fetch(url)
            blob = await genImagerResponse.blob()
            break

          default:
            throw new Error('Unsupported model')
        }
      }

      if (!blob) {
        throw new Error('No image data received')
      }

      if (!blob.type.startsWith('image/')) {
        throw new Error('Received data is not an image')
      }

      const localUrl = URL.createObjectURL(blob)
      setImageBlob(blob)
      setImageUrl(localUrl)
    } catch (err) {
      console.error('Image generation failed:', err)
      setError(`Image generation failed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const saveImage = async () => {
    if (!imageBlob || !user) return
    
    setSaveLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      const fileName = `${formData.title.replace(/\s+/g, '_') || 'ai_image_' + Date.now()}.png`
      const file = new File([imageBlob], fileName, { type: 'image/png' })

      const uploaded = await uploadImage({
        file,
        title: formData.title || formData.prompt.slice(0, 50),
        description: formData.description,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        userId: user.id
      })

      if (!uploaded?.image_url) {
        throw new Error('Image upload failed - no URL returned')
      }

      await generateAIImage({
        prompt: formData.prompt,
        title: uploaded.title,
        description: uploaded.description,
        tags: uploaded.tags,
        userId: user.id,
        imageUrl: uploaded.image_url,
        model: formData.model
      })

      setSuccess('Image saved successfully!')
      setImageUrl(null)
      setImageBlob(null)
      setFormData({
        prompt: '',
        negativePrompt: '',
        model: models[0].value,
        title: '',
        description: '',
        tags: ''
      })
    } catch (err) {
      console.error('Failed to save image:', err)
      setError(`Failed to save image: ${err.message}`)
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-gray-800/50 p-6 space-y-6">
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded">
          {success}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Image Prompt
          </label>
          <textarea
            value={formData.prompt}
            onChange={e => setFormData({ ...formData, prompt: e.target.value })}
            placeholder="Describe the image you want to generate..."
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Negative Prompt (optional)
          </label>
          <textarea
            value={formData.negativePrompt}
            onChange={e => setFormData({ ...formData, negativePrompt: e.target.value })}
            placeholder="What you don't want in the image..."
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
            rows={2}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">Select AI Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map(m => {
            const Icon = m.icon
            const isSelected = formData.model === m.value
            const isPollinations = m.isPollinations
            
            return (
              <button
                key={m.value}
                type="button"
                className={`p-4 border rounded-lg text-left transition-all ${
                  isSelected
                    ? isPollinations
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-200 dark:ring-blue-800'
                      : 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 ring-2 ring-purple-200 dark:ring-purple-800'
                    : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500'
                } ${isPollinations ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => setFormData({ ...formData, model: m.value })}
              >
                <div className="flex gap-3 items-start">
                  <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                    isPollinations 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-purple-600 dark:text-purple-400'
                  }`} />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">{m.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{m.description}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      <span className="font-medium">Speed:</span> {m.speed} •{' '}
                      <span className="font-medium">Quality:</span> {m.quality}
                      {isPollinations && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-800/50 text-blue-800 dark:text-blue-200 rounded-full">
                          Free Unlimited
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {!imageUrl && (
        <button
          onClick={generateImage}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            loading
              ? 'bg-purple-400 dark:bg-purple-700 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800'
          } text-white`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            'Generate Image'
          )}
        </button>
      )}

      {imageUrl && (
        <div className="space-y-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img
              src={imageUrl}
              alt="AI Generated"
              className="w-full max-h-[70vh] object-contain mx-auto"
              onError={() => setError('Failed to load generated image')}
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your image a title"
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your image for others..."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={e => setFormData({ ...formData, tags: e.target.value })}
                placeholder="fantasy, art, landscape, etc."
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-200"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={saveImage}
                disabled={saveLoading}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                  saveLoading
                    ? 'bg-green-500 dark:bg-green-700 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800'
                } text-white`}
              >
                {saveLoading ? 'Saving...' : 'Save Image'}
              </button>
              <button
                onClick={() => {
                  setImageUrl(null)
                  setImageBlob(null)
                  setError(null)
                }}
                className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md font-medium text-gray-800 dark:text-gray-200 transition-colors"
              >
                Generate New
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}