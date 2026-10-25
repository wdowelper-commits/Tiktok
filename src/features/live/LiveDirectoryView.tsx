/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Radio, AlertCircle, Play, Users, PlusCircle, Wrench } from 'lucide-react';
import { DEMO_LIVE_STREAMS } from '../../lib/mockData';
import { LiveStream } from '../../types';
import { useRouter, Link } from '../../app/Router';
import { useAuth } from '../auth/AuthContext';

export const LiveDirectoryView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [streams] = useState<LiveStream[]>(DEMO_LIVE_STREAMS);
  const [showHostModal, setShowHostModal] = useState(false);

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-white">Live Streaming Directory</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time interactive creator broadcasts and scheduled streams
          </p>
        </div>

        <button
          onClick={() => {
            if (!user) navigate('/login');
            else setShowHostModal(true);
          }}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-rose-900/30 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Host a Stream</span>
        </button>
      </div>

      {/* Honest Provider Architecture Notice (Mandatory per PRD & TRD) */}
      <div className="bg-amber-950/20 border border-amber-800/60 rounded-2xl p-4 text-xs text-amber-200/90 space-y-2">
        <div className="flex items-center gap-2 font-bold text-amber-300">
          <Wrench className="w-4 h-4 text-amber-400" />
          <span>Live Broadcast Infrastructure Notice (v1 Standby)</span>
        </div>
        <p className="text-[11px] leading-relaxed text-amber-300/80">
          As specified in the technical architecture document, Supabase PostgreSQL manages stream metadata and host permissions, but real-time video broadcasting requires a dedicated live-media provider (such as Cloudflare Stream, Mux, or AWS IVS) with server-side API keys and webhook verification. Stream cards below reflect catalog sessions and will indicate "Setup Required" until provider endpoints are configured.
        </p>
      </div>

      {/* Streams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col group"
          >
            {/* Stream Poster / Live Standby */}
            <div className="relative aspect-video bg-zinc-950 flex items-center justify-center p-4">
              <div className="text-center space-y-2">
                <Radio className="w-8 h-8 text-rose-500 mx-auto group-hover:scale-110 transition-transform" />
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-700">
                  {stream.status}
                </span>
              </div>

              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Scheduled</span>
              </div>
            </div>

            {/* Stream Info */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="text-sm font-bold text-white line-clamp-1 group-hover:text-rose-400 transition-colors">
                  {stream.title}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={stream.host?.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-xs text-zinc-300 font-medium">@{stream.host?.username}</span>
                </div>
              </div>

              <Link
                href={`/live/${stream.id}`}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-750 text-white text-xs font-semibold rounded-xl text-center block transition-colors"
              >
                Enter Stream Room
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Host Modal Notice */}
      {showHostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-white space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2 text-white">
              <Radio className="w-5 h-5 text-rose-500" />
              Live Streaming Setup Required
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Hosting live video sessions requires configuring an external live-streaming provider (e.g. Cloudflare Stream / Mux / AWS IVS) with <code className="text-rose-400 bg-zinc-800 px-1 py-0.5 rounded">LIVE_PROVIDER_API_KEY</code> on your Cloudflare server.
            </p>
            <div className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-750 text-[11px] text-zinc-400 space-y-1">
              <p className="font-semibold text-zinc-200">Pending Setup Steps:</p>
              <ul className="list-disc pl-4 space-y-0.5">
                <li>Register live media RTMP/WHIP ingestion endpoint</li>
                <li>Configure server-side ingest credentials</li>
                <li>Verify webhook signatures for stream start/end events</li>
              </ul>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHostModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
