import React, { useEffect, useState } from 'react'
import ImageCard from './ImageCard'

interface Image {
  id: string
  title: string
  description?: string
  tags: string[]
  image_url: string
  is_ai_generated: boolean
  ai_prompt?: string
  ai_model?: string
  like_count: number
  comment_count: number
  created_at: string
}

interface MasonryGridProps {
  images: Image[]
  loading?: boolean
}

export default function MasonryGrid({ images, loading }: MasonryGridProps) {
  const [columns, setColumns] = useState(4)

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth
      if (width < 640) setColumns(1)
      else if (width < 768) setColumns(2)
      else if (width < 1024) setColumns(3)
      else setColumns(4)
    }

    updateColumns()
    window.addEventListener('resize', updateColumns)
    return () => window.removeEventListener('resize', updateColumns)
  }, [])

  const getColumnImages = () => {
    const columnArrays: Image[][] = Array.from({ length: columns }, () => [])
    images.forEach((image, index) => {
      columnArrays[index % columns].push(image)
    })
    return columnArrays
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-gray-200 rounded-xl animate-pulse"
              style={{ height: `${200 + Math.random() * 200}px` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
        <p className="text-gray-500">Start creating your collection by uploading or generating images.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getColumnImages().map((columnImages, columnIndex) => (
          <div key={columnIndex} className="space-y-4">
            {columnImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onClick={() => onImageClick?.(image)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}