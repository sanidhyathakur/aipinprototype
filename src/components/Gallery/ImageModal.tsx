import React, { useState, useEffect } from 'react';
import { X, Heart, Share2, Download, MessageCircle, Send, Trash2, Sparkles, Check, User } from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';
import { useInteractions } from '../../hooks/useInteractions';
import { toast } from 'react-hot-toast';

interface ImageModalProps {
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
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageModal({ image, isOpen, onClose }: ImageModalProps) {
  const { user } = useAuthContext();
  const { 
    comments, 
    loading, 
    error,
    fetchComments, 
    addComment, 
    deleteComment, 
    toggleLike, 
    checkUserLike 
  } = useInteractions();
  
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(image.like_count);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'details'>('comments');

  useEffect(() => {
    if (isOpen) {
      fetchComments(image.id);
      if (user) {
        checkUserLike(image.id, user.id).then(setIsLiked);
      }
    }
  }, [isOpen, image.id, user]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like images');
      return;
    }

    try {
      const liked = await toggleLike(image.id, user.id);
      setIsLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
      toast.success(liked ? 'Image liked!' : 'Like removed');
    } catch (error) {
      toast.error('Failed to update like');
      console.error('Error toggling like:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      await addComment(image.id, newComment.trim(), user.id);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
      console.error('Error deleting comment:', error);
    }
  };

  const handleShare = async () => {
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
        toast.success('Link copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('Failed to share');
        console.error('Error sharing:', error);
      }
    }
  };

  const handleDownload = async () => {
    const toastId = toast.loading('Preparing download...');
    try {
      const response = await fetch(image.image_url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.title.replace(/\s+/g, '_')}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Download started!', { id: toastId });
    } catch (error) {
      toast.error('Failed to download image', { id: toastId });
      console.error('Error downloading image:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 min-h-[300px]">
          <img
            src={image.image_url}
            alt={image.title}
            className="max-w-full max-h-[70vh] object-contain"
            loading="lazy"
          />
        </div>

        {/* Details Section */}
        <div className="w-full md:w-96 flex flex-col border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {image.title}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Uploaded {new Date(image.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'comments' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('comments')}
            >
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Comments ({comments.length})
              </div>
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${activeTab === 'details' ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500' : 'text-gray-500 dark:text-gray-400'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'details' ? (
              <div className="p-4 space-y-4">
                {image.description && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Description</h3>
                    <p className="text-gray-700 dark:text-gray-300">{image.description}</p>
                  </div>
                )}

                {image.is_ai_generated && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">AI Generation</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      <span className="text-purple-600 dark:text-purple-400">
                        {image.ai_model || 'AI Generated'}
                      </span>
                    </div>
                    {image.ai_prompt && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Prompt</h4>
                        <p className="text-sm bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                          {image.ai_prompt}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {image.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {image.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isLiked ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} transition-colors`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likeCount}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                      <span>Share</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Comments List */}
                <div className="p-4 space-y-4">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                    </div>
                  ) : error ? (
                    <div className="text-center py-8 text-red-500">
                      Failed to load comments
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No comments yet. Be the first to comment!
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="flex-shrink-0">
                          {comment.user_profiles.username || comment.user_profiles.full_name ? (
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                              {(comment.user_profiles.full_name || comment.user_profiles.username)?.charAt(0).toUpperCase()}
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                {comment.user_profiles.username || comment.user_profiles.full_name || comment.user_profiles.email}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                            {user?.id === comment.user_id && (
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors p-1"
                                title="Delete comment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-gray-700 dark:text-gray-300 break-words">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment */}
                {user && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        disabled={isSubmitting}
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Post comment"
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}