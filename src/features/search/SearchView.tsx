/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Film, Users, Play } from 'lucide-react';
import { useVideos } from '../videos/VideoContext';
import { DEMO_PROFILES } from '../../lib/mockData';
import { useRouter, Link } from '../../app/Router';

export const SearchView: React.FC = () => {
  const { videos } = useVideos();
  const { searchParams, navigate } = useRouter();

  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'videos' | 'accounts'>('videos');

  const trimmedQuery = query.toLowerCase().trim();

  // Filtered videos
  const filteredVideos = videos.filter((v) => {
    if (!trimmedQuery) return true;
    return (
      v.title.toLowerCase().includes(trimmedQuery) ||
      (v.description && v.description.toLowerCase().includes(trimmedQuery)) ||
      (v.owner?.username && v.owner.username.toLowerCase().includes(trimmedQuery))
    );
  });

  // Filtered accounts
  const allProfiles = Object.values(DEMO_PROFILES);
  const filteredProfiles = allProfiles.filter((p) => {
    if (!trimmedQuery) return true;
    return (
      p.username.toLowerCase().includes(trimmedQuery) ||
      (p.display_name && p.display_name.toLowerCase().includes(trimmedQuery)) ||
      (p.bio && p.bio.toLowerCase().includes(trimmedQuery))
    );
  });

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-5">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos, creators, hashtags..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500 shadow-inner"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-3 border-b border-zinc-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('videos')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${
            activeTab === 'videos'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Videos ({filteredVideos.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-colors ${
            activeTab === 'accounts'
              ? 'border-rose-500 text-rose-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Accounts ({filteredProfiles.length})</span>
        </button>
      </div>

      {/* Results View */}
      {activeTab === 'videos' ? (
        filteredVideos.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Film className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No videos found</h3>
            <p className="text-xs text-zinc-500">Try searching for keywords like "Tokyo", "recipe", or "skate".</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredVideos.map((vid) => (
              <Link
                key={vid.id}
                href={`/video/${vid.id}`}
                className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 aspect-[9/16] flex flex-col justify-end p-2.5 transition-all hover:scale-[1.02]"
              >
                <img
                  src={vid.thumbnail_path || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80'}
                  alt={vid.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <img
                      src={vid.owner?.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span className="text-[10px] text-zinc-300 font-medium line-clamp-1">
                      @{vid.owner?.username}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-white line-clamp-2 leading-tight">
                    {vid.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Play className="w-3 h-3 fill-white/80" />
                    <span>{vid.likes_count || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : (
        /* Accounts Tab */
        filteredProfiles.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <Users className="w-10 h-10 text-zinc-600 mx-auto" />
            <h3 className="text-sm font-semibold text-white">No accounts found</h3>
            <p className="text-xs text-zinc-500">Try searching for creator usernames or tags.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProfiles.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-colors"
              >
                <Link href={`/u/${p.username}`} className="flex items-center gap-3">
                  <img
                    src={p.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={p.username}
                    className="w-11 h-11 rounded-full object-cover border border-zinc-700"
                  />
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">@{p.username}</h4>
                    <p className="text-xs text-zinc-400">{p.display_name || 'Creator'}</p>
                    {p.bio && <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{p.bio}</p>}
                  </div>
                </Link>

                <Link
                  href={`/u/${p.username}`}
                  className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
