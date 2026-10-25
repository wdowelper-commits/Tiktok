/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Film, ShieldAlert, CheckCircle, Trash2, Eye, EyeOff } from 'lucide-react';
import { useVideos } from '../videos/VideoContext';
import { Video, VideoStatus } from '../../types';
import { Link } from '../../app/Router';

export const AdminVideosView: React.FC = () => {
  const { videos } = useVideos();
  const [videoList, setVideoList] = useState<Video[]>(videos);
  const [filter, setFilter] = useState<string>('all');

  const filtered = videoList.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const handleStatusChange = (videoId: string, newStatus: VideoStatus) => {
    setVideoList((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, status: newStatus } : v))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-cyan-400" />
            Video Moderation & Enforcement
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Published catalog, restricted content, and removed uploads
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Videos ({videoList.length})</option>
          <option value="published">Published</option>
          <option value="restricted">Restricted</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-zinc-850 rounded-2xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-[10px] uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Video</th>
              <th className="py-3 px-4">Creator</th>
              <th className="py-3 px-4">Duration</th>
              <th className="py-3 px-4">Visibility</th>
              <th className="py-3 px-4">Moderation Status</th>
              <th className="py-3 px-4 text-right">Moderator Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {filtered.map((v) => (
              <tr key={v.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={v.thumbnail_path || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=100&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover border border-zinc-750 flex-shrink-0"
                    />
                    <div className="min-w-0 max-w-xs">
                      <Link href={`/video/${v.id}`} className="font-semibold text-white hover:underline truncate block">
                        {v.title}
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-mono">ID: {v.id}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-zinc-400">@{v.owner?.username || 'user'}</td>
                <td className="py-3.5 px-4 font-mono text-zinc-400">{v.duration_seconds || 15}s</td>
                <td className="py-3.5 px-4 uppercase text-[10px] text-zinc-400 font-mono">
                  {v.visibility}
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      v.status === 'published'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : v.status === 'restricted'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {v.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {v.status !== 'published' && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'published')}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Restore
                      </button>
                    )}
                    {v.status === 'published' && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'restricted')}
                        className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Restrict
                      </button>
                    )}
                    {v.status !== 'removed' && (
                      <button
                        onClick={() => handleStatusChange(v.id, 'removed')}
                        className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 rounded-lg text-[11px] font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
