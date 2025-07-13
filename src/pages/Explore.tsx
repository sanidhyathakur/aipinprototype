import React, { useEffect, useState } from 'react'
import { Search, Filter, Sparkles, TrendingUp } from 'lucide-react'
import MasonryGrid from '../components/Gallery/MasonryGrid'
import { useImages } from '../hooks/useImages'
import { useTheme } from '../contexts/ThemeContext' // Import the useTheme hook

export default function Explore() {
  const { images, loading, fetchAllImages } = useImages()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'ai' | 'uploads'>('all')
  const { isDark } = useTheme() // Get the current theme

  useEffect(() => {
    fetchAllImages()
  }, [])

  const filteredImages = images.filter(image => {
    const matchesSearch = searchTerm === '' || 
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'ai' && image.is_ai_generated) ||
      (selectedFilter === 'uploads' && !image.is_ai_generated)

    return matchesSearch && matchesFilter
  })

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            Explore Gallery
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Discover amazing creations from our community. Browse through uploads, 
            AI-generated masterpieces, and trending content.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'} w-5 h-5`} />
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
                isDark 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'border-gray-300 bg-white'
              }`}
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-emerald-500 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>All</span>
            </button>
            <button
              onClick={() => setSelectedFilter('ai')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'ai'
                  ? 'bg-purple-500 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Generated</span>
            </button>
            <button
              onClick={() => setSelectedFilter('uploads')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === 'uploads'
                  ? 'bg-teal-500 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Uploads</span>
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            {filteredImages.length} {filteredImages.length === 1 ? 'result' : 'results'}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* Images Grid */}
        <MasonryGrid images={filteredImages} loading={loading} />
      </div>
    </div>
  )
}