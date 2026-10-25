/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Flag,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Plus,
  Check,
} from 'lucide-react';
import { Video } from '../../types';
import { useVideos } from '../videos/VideoContext';
import { useAuth } from '../auth/AuthContext';
import { useRouter, Link } from '../../app/Router';
import { CommentDrawer } from '../../components/CommentDrawer';
import { ReportModal } from '../../components/ReportModal';

interface VideoFeedItemProps {
  video: Video;
  isActive: boolean;
}

export const VideoFeedItem: React.FC<VideoFeedItemProps> = ({ video, isActive }) => {
  const { toggleLike, toggleFollow, isMuted, toggleMute } = useVideos();
  const { user } = useAuth();
  const { navigate } = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayIcon, setShowPlayIcon] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);

  // Auto-play / pause based on active state in feed
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive) {
      setHasPlaybackError(false);
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.warn('Auto-play prevented or stream failed:', err);
            setIsPlaying(false);
          });
      }
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  const handleTogglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasPlaybackError(true));
    }
    setShowPlayIcon(true);
    setTimeout(() => setShowPlayIcon(false), 600);
  };

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await toggleLike(video.id);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleFollowClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await toggleFollow(video.owner_id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const videoUrl = `${window.location.origin}/video/${video.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(videoUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <>
      <div className="relative w-full h-[calc(100vh-7rem)] sm:h-[620px] max-w-sm sm:max-w-md mx-auto sm:my-4 rounded-none sm:rounded-2xl overflow-hidden bg-zinc-950 border-0 sm:border border-zinc-800 shadow-2xl flex items-center justify-center select-none group">
        {/* Video Player & Poster */}
        <div className="relative w-full h-full cursor-pointer overflow-hidden bg-zinc-950" onClick={handleTogglePlay}>
          {video.thumbnail_path && (
            <img
              src={video.thumbnail_path}
              alt={video.title}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isPlaying ? 'opacity-0' : 'opacity-100'
              }`}
            />
          )}

          <video
            ref={videoRef}
            src={video.storage_path}
            poster={video.thumbnail_path || undefined}
            loop
            playsInline
            muted={isMuted}
            onError={() => {
              // Gracefully handle codec limitations in headless or restricted environments
              setIsPlaying(false);
            }}
            className="w-full h-full object-cover"
          />

          {/* Play/Pause indicator splash */}
          {showPlayIcon && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white animate-out fade-out zoom-out duration-500">
                {isPlaying ? <Play className="w-8 h-8 fill-white ml-1" /> : <Pause className="w-8 h-8 fill-white" />}
              </div>
            </div>
          )}

          {/* Subtle gradient vignette at bottom for captions readability */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none z-10" />
        </div>

        {/* Top Controls: Sound Toggle */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom Left: Creator info & captions */}
        <div className="absolute bottom-4 left-4 right-20 z-20 text-left pointer-events-auto space-y-2">
          {/* Creator badge */}
          <div className="flex items-center gap-2.5">
            <Link
              href={`/u/${video.owner?.username || 'user'}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 group/author"
            >
              <img
                src={video.owner?.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={video.owner?.username || 'Creator'}
                className="w-10 h-10 rounded-full object-cover border-2 border-white/80 shadow-md group-hover/author:scale-105 transition-transform"
              />
              <div className="leading-tight">
                <span className="font-bold text-sm text-white drop-shadow block">
                  @{video.owner?.username || 'creator'}
                </span>
                <span className="text-[11px] text-zinc-300 drop-shadow line-clamp-1">
                  {video.owner?.display_name || 'Creator'}
                </span>
              </div>
            </Link>

            {user?.id !== video.owner_id && (
              <button
                onClick={handleFollowClick}
                aria-label={video.is_following_owner ? 'Following creator' : 'Follow creator'}
                className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                  video.is_following_owner
                    ? 'bg-zinc-800/80 text-zinc-300 border border-zinc-700'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/40'
                }`}
              >
                {video.is_following_owner ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" />
                    <span>Follow</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Title & Description */}
          <Link
            href={`/video/${video.id}`}
            onClick={(e) => e.stopPropagation()}
            className="block text-white group/title"
          >
            <h2 className="text-xs sm:text-sm font-semibold drop-shadow line-clamp-2 hover:underline">
              {video.title}
            </h2>
          </Link>
          {video.description && (
            <p className="text-xs text-zinc-200/90 line-clamp-2 drop-shadow font-normal">
              {video.description}
            </p>
          )}
        </div>

        {/* Right Action Bar (TikTok style) */}
        <div className="absolute right-3 bottom-12 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like */}
          <button
            onClick={handleLikeClick}
            aria-label={`Like video (${video.likes_count || 0})`}
            className="flex flex-col items-center gap-1 group/btn focus:outline-none"
          >
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                video.is_liked_by_me
                  ? 'bg-rose-500/20 text-rose-500 scale-110'
                  : 'bg-black/50 backdrop-blur-md text-white hover:bg-black/70 group-hover/btn:scale-105'
              }`}
            >
              <Heart
                className={`w-6 h-6 ${video.is_liked_by_me ? 'fill-rose-500 stroke-rose-500' : ''}`}
              />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{video.likes_count || 0}</span>
          </button>

          {/* Comment */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsCommentsOpen(true);
            }}
            aria-label={`Comments (${video.comments_count || 0})`}
            className="flex flex-col items-center gap-1 group/btn focus:outline-none"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 group-hover/btn:scale-105 transition-all">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">{video.comments_count || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShareClick}
            aria-label="Share video link"
            className="flex flex-col items-center gap-1 group/btn focus:outline-none"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/70 group-hover/btn:scale-105 transition-all">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold drop-shadow">
              {copiedShare ? 'Copied' : 'Share'}
            </span>
          </button>

          {/* Report */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsReportOpen(true);
            }}
            aria-label="Report video"
            className="flex flex-col items-center gap-1 group/btn focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-black/60 transition-all">
              <Flag className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Comment Drawer Modal */}
      <CommentDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        video={video}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="video"
        targetId={video.id}
        targetTitle={video.title}
      />
    </>
  );
};
