import React, { useEffect } from 'react'
import { Sparkles, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import MasonryGrid from '../components/Gallery/MasonryGrid'
import { useImages } from '../hooks/useImages'
import { useAuthContext } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext' // Import the useTheme hook

export default function Generated() {
  const { user } = useAuthContext()
  const { images, loading, fetchUserImages } = useImages()
  const { isDark } = useTheme() // Get the current theme

  useEffect(() => {
    if (user) {
      fetchUserImages(user.id)
    }
  }, [user])

  const aiImages = images.filter(img => img.is_ai_generated)

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={`text-3xl font-bold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <Sparkles className="w-8 h-8 text-purple-500 mr-3" />
              AI Generated Images
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {aiImages.length} AI-generated {aiImages.length === 1 ? 'masterpiece' : 'masterpieces'}
            </p>
          </div>
          <Link
            to="/upload"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-medium rounded-full hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate New
          </Link>
        </div>

        {/* AI Generation Info */}
        <div className={`rounded-xl p-6 mb-8 ${
          isDark 
            ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-800/50' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
        } border`}>
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Create with AI Magic
              </h3>
              <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Transform your ideas into stunning visuals with our AI image generator. 
                Simply describe what you want to see, and watch it come to life.
              </p>
              <Link
                to="/upload"
                className={`inline-flex items-center font-medium ${
                  isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                }`}
              >
                Start generating →
              </Link>
            </div>
          </div>
        </div>

        {/* Images Grid */}
        {aiImages.length > 0 ? (
          <MasonryGrid images={aiImages} loading={loading} />
        ) : (
          <div className="text-center py-16">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDark 
                ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50' 
                : 'bg-gradient-to-r from-purple-100 to-pink-100'
            }`}>
              <Sparkles className="w-12 h-12 text-purple-500" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No AI images yet
            </h3>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Start creating amazing AI-generated images with just a simple prompt.
            </p>
            <Link
              to="/upload"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium rounded-full hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Generate Your First Image
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}