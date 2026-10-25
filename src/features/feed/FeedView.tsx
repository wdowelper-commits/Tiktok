/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { ChevronUp, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { useVideos } from '../videos/VideoContext';
import { VideoFeedItem } from './VideoFeedItem';
import { AdPlacement } from '../../components/AdPlacement';

export const FeedView: React.FC = () => {
  const { videos, isLoading, error, refreshVideos, activeVideoIndex, setActiveVideoIndex } = useVideos();
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation for feed (Up / Down)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyK'].includes(e.code)) {
        e.preventDefault();
        setActiveVideoIndex(Math.max(0, activeVideoIndex - 1));
      } else if (['ArrowDown', 'KeyJ'].includes(e.code)) {
        e.preventDefault();
        setActiveVideoIndex(Math.min(videos.length - 1, activeVideoIndex + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoIndex, videos.length, setActiveVideoIndex]);

  const handleNext = () => {
    if (activeVideoIndex < videos.length - 1) {
      setActiveVideoIndex(activeVideoIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeVideoIndex > 0) {
      setActiveVideoIndex(activeVideoIndex - 1);
    }
  };

  if (isLoading && videos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3 min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-zinc-400 text-sm">Loading discovery feed...</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 min-h-[60vh]">
        <AlertCircle className="w-12 h-12 text-zinc-600 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-white">No published videos found</h2>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            Be the first to upload a video or refresh the discovery feed.
          </p>
        </div>
        <button
          onClick={refreshVideos}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors"
        >
          Refresh Feed
        </button>
      </div>
    );
  }

  const currentVideo = videos[activeVideoIndex] || videos[0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full px-2 sm:px-4 py-1">
      {/* Feed Controller on Desktop */}
      <div className="hidden sm:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-2">
        <button
          onClick={handlePrev}
          disabled={activeVideoIndex === 0}
          aria-label="Previous video"
          className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 flex items-center justify-center text-white transition-all shadow-lg"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <span className="text-[10px] text-zinc-500 text-center font-mono py-1">
          {activeVideoIndex + 1}/{videos.length}
        </span>
        <button
          onClick={handleNext}
          disabled={activeVideoIndex === videos.length - 1}
          aria-label="Next video"
          className="w-10 h-10 rounded-full bg-zinc-900/80 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 flex items-center justify-center text-white transition-all shadow-lg"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Main Active Video Card */}
      <div ref={feedContainerRef} className="w-full flex flex-col items-center">
        <VideoFeedItem video={currentVideo} isActive={true} />

        {/* Compliant Ad Placement between feed items */}
        <div className="w-full max-w-md px-2">
          <AdPlacement placementId="feed_interstitial" format="banner" />
        </div>
      </div>
    </div>
  );
};
