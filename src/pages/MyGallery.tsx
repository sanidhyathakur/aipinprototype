import React, { useEffect } from 'react'
import { Upload, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import MasonryGrid from '../components/Gallery/MasonryGrid'
import { useImages } from '../hooks/useImages'
import { useAuthContext } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

export default function MyGallery() {
  const { user } = useAuthContext()
  const { images, loading, fetchUserImages } = useImages()
  const { isDark } = useTheme()

  useEffect(() => {
    if (user) {
      fetchUserImages(user.id)
    }
  }, [user])

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              My Gallery
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {images.length} {images.length === 1 ? 'image' : 'images'} in your collection
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-full hover:from-emerald-600 hover:to-teal-700 transition-all transform hover:scale-105"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Image
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`rounded-xl p-6 shadow-sm ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-emerald-500" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Total Uploads
                </p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {images.filter(img => !img.is_ai_generated).length}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-6 shadow-sm ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <Sparkles className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  AI Generated
                </p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {images.filter(img => img.is_ai_generated).length}
                </p>
              </div>
            </div>
          </div>
          <div className={`rounded-xl p-6 shadow-sm ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'
              }`}>
                <span className={`font-bold ${
                  isDark ? 'text-emerald-400' : 'text-emerald-600'
                }`}>★</span>
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  This Month
                </p>
                <p className={`text-2xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {images.filter(img => {
                    const imageDate = new Date(img.created_at)
                    const now = new Date()
                    return imageDate.getMonth() === now.getMonth() && 
                          imageDate.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        <MasonryGrid images={images} loading={loading} />
      </div>
    </div>
  )
}