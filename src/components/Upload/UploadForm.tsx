import React, { useState } from 'react'
import { Upload, X, Image, Tag } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { useImages } from '../../hooks/useImages'
import { useTheme } from '../../contexts/ThemeContext'

export default function UploadForm() {
  const { user } = useAuthContext()
  const { uploadImage } = useImages()
  const { isDark } = useTheme()
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: '',
    file: null as File | null
  })

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, file }))
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const clearFile = () => {
    setFormData(prev => ({ ...prev, file: null }))
    setPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.file || !user) return

    setLoading(true)
    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      
      await uploadImage({
        file: formData.file,
        title: formData.title,
        description: formData.description,
        tags: tagsArray,
        userId: user.id
      })

      // Reset form
      setFormData({
        title: '',
        description: '',
        tags: '',
        file: null
      })
      setPreview(null)
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-xl shadow-lg p-8 ${
      isDark ? 'bg-gray-800' : 'bg-white'
    }`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-emerald-500 bg-emerald-900/20'
              : preview
              ? isDark 
                ? 'border-emerald-400/30' 
                : 'border-emerald-300'
              : isDark
                ? 'border-gray-600 hover:border-gray-500'
                : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg shadow-sm"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div>
              <Upload className={`mx-auto h-12 w-12 mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-400'
              }`} />
              <p className={`text-lg font-medium mb-2 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}>
                Drop your image here
              </p>
              <p className={`mb-4 ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                or click to browse files
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-emerald-400 hover:bg-gray-600'
                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                }`}
              >
                <Image className="w-4 h-4 mr-2" />
                Choose File
              </button>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Title *
            </label>
            <input
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="Give your image a catchy title"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="description" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="Describe your image..."
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tags" className={`block text-sm font-medium mb-2 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'border-gray-300 bg-white'
              }`}
              placeholder="nature, landscape, photography (comma separated)"
            />
            <p className={`text-xs mt-1 ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Separate tags with commas to help others discover your image
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!formData.file || !formData.title || loading}
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </div>
  )
}