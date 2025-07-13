import React, { useEffect, useState } from 'react'
import { Sparkles, TrendingUp, Clock } from 'lucide-react'
import MasonryGrid from '../components/Gallery/MasonryGrid'
import { useImages } from '../hooks/useImages'
import { useTheme } from '../contexts/ThemeContext'
import { Link } from 'react-router-dom'

export default function Home() {
  const { images, loading, fetchRecentImages } = useImages()
  const [filter, setFilter] = useState<'recent' | 'trending' | 'ai'>('recent')
  const { isDark } = useTheme()

  useEffect(() => {
    fetchRecentImages()
  }, [])

  const filteredImages = images.filter(image => {
    if (filter === 'ai') return image.is_ai_generated
    return true
  })

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Your Creative Board
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8">
              Discover, create, and share amazing images with AI
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                to="/upload"
                className="bg-white text-emerald-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Creating
              </Link>
              <Link
                to="/explore"
                className="border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-emerald-600 transition-colors"
              >
                Explore Gallery
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`flex space-x-1 p-1 rounded-lg mb-8 w-fit ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setFilter('recent')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'recent'
                ? isDark
                  ? 'bg-gray-700 text-emerald-400 shadow-sm'
                  : 'bg-white text-emerald-600 shadow-sm'
                : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Recent</span>
          </button>
          <button
            onClick={() => setFilter('trending')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'trending'
                ? isDark
                  ? 'bg-gray-700 text-emerald-400 shadow-sm'
                  : 'bg-white text-emerald-600 shadow-sm'
                : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'ai'
                ? isDark
                  ? 'bg-gray-700 text-emerald-400 shadow-sm'
                  : 'bg-white text-emerald-600 shadow-sm'
                : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generated</span>
          </button>
        </div>
      </div>

      {/* Images Grid */}
      <MasonryGrid images={filteredImages} loading={loading} />
    </div>
  )
}