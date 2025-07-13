import React, { useState, useEffect } from 'react';
import { Heart, Download, Share2, Sparkles, MessageCircle, Check } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useInteractions } from '../../hooks/useInteractions';
import ImageModal from './ImageModal';

interface ImageCardProps {
  image: {
    id: string;
    title: string;
    description?: string;
    tags: string[];
    image_url: string;
    is_ai_generated: boolean;
    ai_prompt?: string;
    ai_model?: string;
    like_count: number;
    comment_count: number;
    created_at: string;
  };
}

export default function ImageCard({ image }: ImageCardProps) {
  const { user } = useAuthContext();
  const { 
    toggleLike, 
    checkUserLike,
    comments,
    fetchComments,
    loading: interactionsLoading
  } = useInteractions();
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(image.like_count);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      checkUserLike(image.id, user.id).then(setIsLiked);
    }
  }, [user, image.id, checkUserLike]);

  const handleImageLoad = () => setIsLoaded(true);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || actionLoading) return;

    setActionLoading(true);
    try {
      const liked = await toggleLike(image.id, user.id);
      setIsLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: image.title,
          text: image.description || 'Check out this amazing image!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const openModal = () => {
    setShowModal(true);
    fetchComments(image.id);
  };

  return (
    <>
      <div
        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={openModal}
      >
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {!isLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 animate-pulse" />
          )}
          <img
            src={image.image_url}
            alt={image.title}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
              !isLoaded ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
          />
          
          {/* AI Badge */}
          {image.is_ai_generated && (
            <div className="absolute top-3 left-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                <span>{image.ai_model || 'AI'}</span>
              </div>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end">
            <div className="w-full p-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
              <h3 className="text-white font-semibold line-clamp-2">
                {image.title}
              </h3>
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-3 text-white/80">
                  <div className="flex items-center gap-1 text-sm">
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span>{likeCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <MessageCircle className="w-4 h-4" />
                    <span>{image.comment_count}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                    title="Share"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-300" />
                    ) : (
                      <Share2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {image.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {image.description}
            </p>
          )}

          {/* Tags */}
          {image.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {image.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {new Date(image.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>
      
      {/* Enhanced Image Modal */}
      {showModal && (
        <ImageModal
          image={image}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          comments={comments}
          likeCount={likeCount}
          isLiked={isLiked}
          onLike={handleLike}
          loading={actionLoading || interactionsLoading}
        />
      )}
    </>
  );
}