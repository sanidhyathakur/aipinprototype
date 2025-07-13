import React, { useState } from 'react'
import { Upload as UploadIcon, Sparkles } from 'lucide-react'
import UploadForm from '../components/Upload/UploadForm'
import AIGenerateForm from '../components/Upload/AIGenerateForm'
import { useTheme } from '../contexts/ThemeContext'

export default function Upload() {
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload')
  const { isDark } = useTheme()

  return (
    <div className={`min-h-screen py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create Content
          </h1>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Upload your own images or generate new ones with AI
          </p>
        </div>

        {/* Tabs */}
        <div className={`flex space-x-1 p-1 rounded-lg mb-8 w-fit mx-auto ${
          isDark ? 'bg-gray-800' : 'bg-gray-100'
        }`}>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'upload'
                ? isDark
                  ? 'bg-gray-700 text-emerald-400 shadow-sm'
                  : 'bg-white text-emerald-600 shadow-sm'
                : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UploadIcon className="w-4 h-4" />
            <span>Upload Image</span>
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'generate'
                ? isDark
                  ? 'bg-gray-700 text-purple-400 shadow-sm'
                  : 'bg-white text-purple-600 shadow-sm'
                : isDark
                  ? 'text-gray-300 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate with AI</span>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'upload' ? <UploadForm /> : <AIGenerateForm />}
      </div>
    </div>
  )
}