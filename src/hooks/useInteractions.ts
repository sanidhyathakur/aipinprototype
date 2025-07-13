import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Comment = Database['public']['Tables']['comments']['Row'] & {
  user_profiles: {
    full_name: string | null;
    username: string | null;
    email: string;
  };
};

type Like = Database['public']['Tables']['likes']['Row'];

export function useInteractions() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async (imageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('comments')
        .select(`
          *,
          user_profiles (
            full_name,
            username,
            email
          )
        `)
        .eq('image_id', imageId)
        .order('created_at', { ascending: true });

      if (supabaseError) throw supabaseError;
      setComments(data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  }, []);

  const addComment = useCallback(async (imageId: string, content: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('comments')
        .insert({
          image_id: imageId,
          content,
          user_id: userId
        })
        .select(`
          *,
          user_profiles (
            full_name,
            username,
            email
          )
        `);

      if (supabaseError) throw supabaseError;
      
      if (data?.[0]) {
        setComments(prev => [...prev, data[0]]);
      }
      
      return data?.[0];
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: supabaseError } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (supabaseError) throw supabaseError;
      
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLikes = useCallback(async (imageId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from('likes')
        .select('*')
        .eq('image_id', imageId);

      if (supabaseError) throw supabaseError;
      setLikes(data || []);
    } catch (err) {
      console.error('Error fetching likes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch likes');
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleLike = useCallback(async (imageId: string, userId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('image_id', imageId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        const { error: deleteError } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (deleteError) throw deleteError;
        setLikes(prev => prev.filter(like => !(like.image_id === imageId && like.user_id === userId)));
        return false;
      } else {
        // Like
        const { data: newLike, error: insertError } = await supabase
          .from('likes')
          .insert({
            image_id: imageId,
            user_id: userId
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setLikes(prev => [...prev, newLike]);
        return true;
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkUserLike = useCallback(async (imageId: string, userId: string) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('likes')
        .select('id')
        .eq('image_id', imageId)
        .eq('user_id', userId)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') throw supabaseError;
      return !!data;
    } catch (err) {
      console.error('Error checking user like:', err);
      return false;
    }
  }, []);

  return {
    comments,
    likes,
    loading,
    error,
    fetchComments,
    addComment,
    deleteComment,
    fetchLikes,
    toggleLike,
    checkUserLike,
    setError // Allow manual error clearing
  };
}