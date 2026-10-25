/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Heart, MessageCircle, Share2, Flag, AlertTriangle } from 'lucide-react';
import { useRouter, Link } from '../../app/Router';
import { useVideos } from './VideoContext';
import { useAuth } from '../auth/AuthContext';
import { Video } from '../../types';
import { CommentDrawer } from '../../components/CommentDrawer';
import { ReportModal } from '../../components/ReportModal';

export const VideoDetailView: React.FC = () => {
  const { params, navigate } = useRouter();
  const { videos, toggleLike, toggleFollow } = useVideos();
  const { user } = useAuth();

  const [video, setVideo] = useState<Video | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.videoId) {
      const found = videos.find((v) => v.id === params.videoId);
      if (found) {
        setVideo(found);
      }
    }
  }, [params.videoId, videos]);

  if (!video) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500" />
        <h2 className="text-base font-bold">Video not found</h2>
        <p className="text-xs text-zinc-400">
          This video may have been removed or restricted by moderators.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs rounded-xl transition-colors"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to feed
      </button>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Video Player Column */}
        <div className="md:col-span-7 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden aspect-[9/16] max-h-[640px] flex items-center justify-center relative shadow-2xl">
          <video
            src={video.storage_path}
            poster={video.thumbnail_path || undefined}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info & Comments Column */}
        <div className="md:col-span-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-5">
          {/* Author */}
          <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
            <Link href={`/u/${video.owner?.username || 'user'}`} className="flex items-center gap-3">
              <img
                src={video.owner?.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={video.owner?.username || 'Creator'}
                className="w-11 h-11 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <span className="font-bold text-sm block">@{video.owner?.username || 'creator'}</span>
                <span className="text-xs text-zinc-400">{video.owner?.display_name || 'Creator'}</span>
              </div>
            </Link>

            {user?.id !== video.owner_id && (
              <button
                onClick={() => toggleFollow(video.owner_id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  video.is_following_owner
                    ? 'bg-zinc-800 text-zinc-300'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {video.is_following_owner ? 'Following' : 'Follow'}
              </button>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <h1 className="text-base font-bold text-white">{video.title}</h1>
            {video.description && (
              <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {video.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-[11px] text-zinc-500 pt-1">
              <span>Published: {new Date(video.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span className="uppercase text-emerald-400 font-medium">{video.visibility}</span>
            </div>
          </div>

          {/* Engagement actions bar */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <button
              onClick={() => toggleLike(video.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                video.is_liked_by_me
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${video.is_liked_by_me ? 'fill-rose-500' : ''}`} />
              <span>{video.likes_count || 0}</span>
            </button>

            <button
              onClick={() => setIsCommentsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{video.comments_count || 0}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={() => setIsReportOpen(true)}
              aria-label="Report video"
              className="p-2 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <CommentDrawer
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
        video={video}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="video"
        targetId={video.id}
        targetTitle={video.title}
      />
    </div>
  );
};
