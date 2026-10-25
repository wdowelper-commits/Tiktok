/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Video, Comment, ReportTargetType } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { DEMO_VIDEOS, DEMO_COMMENTS, DEMO_PROFILES } from '../../lib/mockData';
import { useAuth } from '../auth/AuthContext';
import { validateVideoFile, validateVideoMetadata } from '../../lib/validation/rules';

interface VideoContextType {
  videos: Video[];
  isLoading: boolean;
  error: string | null;
  toggleLike: (videoId: string) => Promise<void>;
  toggleFollow: (ownerId: string) => Promise<void>;
  addComment: (videoId: string, body: string) => Promise<{ error?: string; comment?: Comment }>;
  deleteComment: (commentId: string) => Promise<void>;
  getVideoComments: (videoId: string) => Promise<Comment[]>;
  createReport: (params: {
    target_type: ReportTargetType;
    target_id: string;
    reason: string;
    details?: string;
  }) => Promise<{ error?: string; success?: boolean }>;
  uploadVideo: (params: {
    file: File;
    title: string;
    description?: string;
    visibility?: 'public' | 'unlisted' | 'private';
  }) => Promise<{ error?: string; video?: Video }>;
  refreshVideos: () => Promise<void>;
  activeVideoIndex: number;
  setActiveVideoIndex: (idx: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const isConfigured = isSupabaseConfigured();

  const [videos, setVideos] = useState<Video[]>(DEMO_VIDEOS);
  const [commentsMap, setCommentsMap] = useState<Record<string, Comment[]>>({
    'vid-1': DEMO_COMMENTS.filter((c) => c.video_id === 'vid-1'),
    'vid-2': DEMO_COMMENTS.filter((c) => c.video_id === 'vid-2'),
  });
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({
    'user-alex': true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => setIsMuted((prev) => !prev);

  // Load videos on mount or backend change
  const refreshVideos = async () => {
    if (!isConfigured || !supabase) {
      setVideos(DEMO_VIDEOS);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Fetch published public videos
      const { data, error: fetchErr } = await supabase
        .from('videos')
        .select(`
          *,
          owner:profiles!owner_id (*)
        `)
        .eq('status', 'published')
        .eq('visibility', 'public')
        .order('published_at', { ascending: false });

      if (fetchErr) throw fetchErr;

      if (data) {
        // Fetch user likes if authenticated
        let userLikes: string[] = [];
        if (user) {
          const { data: likesData } = await supabase
            .from('video_likes')
            .select('video_id')
            .eq('user_id', user.id);
          userLikes = (likesData || []).map((l: { video_id: string }) => l.video_id);
        }

        const formattedVideos: Video[] = data.map((v: any) => ({
          ...v,
          is_liked_by_me: userLikes.includes(v.id),
          likes_count: v.likes_count || 0,
          comments_count: v.comments_count || 0,
        }));

        setVideos(formattedVideos);
      }
    } catch (err: any) {
      console.warn('Could not fetch videos from Supabase:', err.message);
      setError('Failed to fetch videos from server. Showing local catalog.');
      setVideos(DEMO_VIDEOS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshVideos();
  }, [isConfigured, user?.id]);

  const toggleLike = async (videoId: string) => {
    if (!user) {
      throw new Error('Please sign in to like videos');
    }

    // Optimistic UI update
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === videoId) {
          const isLiked = !v.is_liked_by_me;
          return {
            ...v,
            is_liked_by_me: isLiked,
            likes_count: Math.max(0, (v.likes_count || 0) + (isLiked ? 1 : -1)),
          };
        }
        return v;
      })
    );

    if (isConfigured && supabase) {
      const currentVideo = videos.find((v) => v.id === videoId);
      const currentlyLiked = currentVideo?.is_liked_by_me;

      if (currentlyLiked) {
        const { error: unlikeErr } = await supabase
          .from('video_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);

        if (unlikeErr) {
          console.error('Unlike failed, reverting optimistic update:', unlikeErr);
          // Revert
          refreshVideos();
        }
      } else {
        const { error: likeErr } = await supabase.from('video_likes').insert({
          user_id: user.id,
          video_id: videoId,
        });

        if (likeErr) {
          console.error('Like failed, reverting optimistic update:', likeErr);
          refreshVideos();
        }
      }
    }
  };

  const toggleFollow = async (ownerId: string) => {
    if (!user) {
      throw new Error('Please sign in to follow creators');
    }
    if (user.id === ownerId) {
      throw new Error('You cannot follow yourself');
    }

    const isFollowing = !!followingMap[ownerId];
    setFollowingMap((prev) => ({ ...prev, [ownerId]: !isFollowing }));

    setVideos((prev) =>
      prev.map((v) => (v.owner_id === ownerId ? { ...v, is_following_owner: !isFollowing } : v))
    );

    if (isConfigured && supabase) {
      if (isFollowing) {
        const { error: unfollowErr } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', ownerId);

        if (unfollowErr) console.warn('Unfollow error:', unfollowErr);
      } else {
        const { error: followErr } = await supabase.from('follows').insert({
          follower_id: user.id,
          following_id: ownerId,
        });

        if (followErr) console.warn('Follow error:', followErr);
      }
    }
  };

  const getVideoComments = async (videoId: string): Promise<Comment[]> => {
    if (isConfigured && supabase) {
      try {
        const { data, error: err } = await supabase
          .from('comments')
          .select(`
            *,
            user:profiles!user_id (*)
          `)
          .eq('video_id', videoId)
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (!err && data) {
          return data;
        }
      } catch (e) {
        console.warn('Error fetching comments:', e);
      }
    }
    return commentsMap[videoId] || [];
  };

  const addComment = async (
    videoId: string,
    body: string
  ): Promise<{ error?: string; comment?: Comment }> => {
    if (!user) return { error: 'Please sign in to comment' };
    const trimmed = (body || '').trim();
    if (!trimmed) return { error: 'Comment cannot be empty' };

    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      video_id: videoId,
      user_id: user.id,
      body: trimmed,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user: profile || DEMO_PROFILES['current-user'],
    };

    // Optimistic state
    setCommentsMap((prev) => ({
      ...prev,
      [videoId]: [newComment, ...(prev[videoId] || [])],
    }));

    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, comments_count: (v.comments_count || 0) + 1 } : v))
    );

    if (isConfigured && supabase) {
      const { data, error: commErr } = await supabase
        .from('comments')
        .insert({
          video_id: videoId,
          user_id: user.id,
          body: trimmed,
          status: 'published',
        })
        .select(`*, user:profiles!user_id (*)`)
        .single();

      if (commErr) {
        return { error: commErr.message };
      }
      return { comment: data };
    }

    return { comment: newComment };
  };

  const deleteComment = async (commentId: string) => {
    setCommentsMap((prev) => {
      const updated: Record<string, Comment[]> = {};
      Object.keys(prev).forEach((k) => {
        updated[k] = prev[k].filter((c) => c.id !== commentId);
      });
      return updated;
    });

    if (isConfigured && supabase && user) {
      await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
    }
  };

  const createReport = async (params: {
    target_type: ReportTargetType;
    target_id: string;
    reason: string;
    details?: string;
  }): Promise<{ error?: string; success?: boolean }> => {
    if (!user) {
      return { error: 'Please sign in to report content' };
    }

    if (isConfigured && supabase) {
      const { error: repErr } = await supabase.from('reports').insert({
        reporter_id: user.id,
        target_type: params.target_type,
        target_id: params.target_id,
        reason: params.reason,
        details: params.details || null,
        status: 'open',
      });
      if (repErr) return { error: repErr.message };
    }

    return { success: true };
  };

  const uploadVideo = async (params: {
    file: File;
    title: string;
    description?: string;
    visibility?: 'public' | 'unlisted' | 'private';
  }): Promise<{ error?: string; video?: Video }> => {
    if (!user) return { error: 'Authentication required to upload' };

    // Validate file
    const fileVal = validateVideoFile({
      name: params.file.name,
      size: params.file.size,
      type: params.file.type,
    });
    if (!fileVal.valid) {
      return { error: fileVal.error };
    }

    // Validate metadata
    const metaVal = validateVideoMetadata(params.title, params.description);
    if (!metaVal.valid) {
      return { error: metaVal.error };
    }

    const videoId = `vid-${Date.now()}`;
    const visibility = params.visibility || 'public';

    if (isConfigured && supabase) {
      try {
        const randomName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${params.file.name.split('.').pop()}`;
        const storagePath = `${user.id}/${videoId}/${randomName}`;

        // 1. Upload to Supabase Storage bucket 'videos'
        const { error: uploadErr } = await supabase.storage
          .from('videos')
          .upload(storagePath, params.file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadErr) {
          return { error: `Storage upload failed: ${uploadErr.message}` };
        }

        // 2. Get Public or Signed URL
        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(storagePath);
        const videoPlaybackUrl = urlData?.publicUrl || storagePath;

        // 3. Insert record into canonical public.videos table
        // Per PRD: immediate publication after successful validation
        const { data: videoRecord, error: insertErr } = await supabase
          .from('videos')
          .insert({
            id: videoId,
            owner_id: user.id,
            title: params.title.trim(),
            description: params.description?.trim() || null,
            storage_path: videoPlaybackUrl,
            thumbnail_path: null,
            duration_seconds: 15,
            visibility,
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .select(`*, owner:profiles!owner_id (*)`)
          .single();

        if (insertErr) {
          return { error: `Database record creation failed: ${insertErr.message}` };
        }

        setVideos((prev) => [videoRecord, ...prev]);
        return { video: videoRecord };
      } catch (err: any) {
        return { error: err.message || 'Video upload failed' };
      }
    }

    // Local Preview Upload (Demo Mode)
    const localBlobUrl = URL.createObjectURL(params.file);
    const mockNewVideo: Video = {
      id: videoId,
      owner_id: user.id,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      storage_path: localBlobUrl,
      thumbnail_path: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      duration_seconds: 20,
      visibility,
      status: 'published',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      published_at: new Date().toISOString(),
      owner: profile || DEMO_PROFILES['current-user'],
      likes_count: 0,
      comments_count: 0,
      is_liked_by_me: false,
      is_following_owner: false,
    };

    setVideos((prev) => [mockNewVideo, ...prev]);
    return { video: mockNewVideo };
  };

  return (
    <VideoContext.Provider
      value={{
        videos,
        isLoading,
        error,
        toggleLike,
        toggleFollow,
        addComment,
        deleteComment,
        getVideoComments,
        createReport,
        uploadVideo,
        refreshVideos,
        activeVideoIndex,
        setActiveVideoIndex,
        isMuted,
        toggleMute,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
};

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};
