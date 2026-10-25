/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Radio, AlertCircle, Users, MessageSquare, Send, Heart, Flag } from 'lucide-react';
import { useRouter, Link } from '../../app/Router';
import { DEMO_LIVE_STREAMS } from '../../lib/mockData';
import { LiveStream } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { ReportModal } from '../../components/ReportModal';

export const LiveStreamView: React.FC = () => {
  const { params, navigate } = useRouter();
  const { user } = useAuth();
  const liveStreamId = params.liveStreamId;

  const [stream, setStream] = useState<LiveStream | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{ user: string; text: string }>>([
    { user: 'urban_motion', text: 'Excited for this session!' },
    { user: 'sarah_explores', text: 'Audio is super clear 👋' },
  ]);
  const [inputChat, setInputChat] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

  useEffect(() => {
    if (liveStreamId) {
      const found = DEMO_LIVE_STREAMS.find((s) => s.id === liveStreamId) || DEMO_LIVE_STREAMS[0];
      setStream(found);
    }
  }, [liveStreamId]);

  if (!stream) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
        Loading live stream session...
      </div>
    );
  }

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { user: user ? 'You' : 'Guest', text: inputChat.trim() },
    ]);
    setInputChat('');
  };

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-6 space-y-4">
      <button
        onClick={() => navigate('/live')}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Live Directory
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Stream Broadcast Stage */}
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-video bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col items-center justify-center p-8 shadow-2xl">
            {/* Honest Setup Required State */}
            <div className="text-center space-y-3 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <Radio className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-base font-bold text-white">Live Broadcast Standby</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Stream session <code className="text-rose-400 font-mono">#{stream.id}</code> is registered in Supabase. Real-time video playback requires connecting a live media provider (e.g. Cloudflare Stream / Mux).
              </p>
              <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-[11px] text-amber-300">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Provider Connection Pending</span>
              </div>
            </div>

            {/* Stage Overlays */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-rose-600 px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-lg">
                <Radio className="w-3 h-3 animate-pulse" />
                LIVE
              </span>
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-zinc-300">
                <Users className="w-3 h-3" />
                284
              </span>
            </div>
          </div>

          {/* Stream Header Details */}
          <div className="flex items-start justify-between bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <img
                src={stream.host?.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-zinc-700"
              />
              <div>
                <h1 className="text-base font-bold text-white">{stream.title}</h1>
                <Link
                  href={`/u/${stream.host?.username}`}
                  className="text-xs text-rose-400 hover:underline font-medium"
                >
                  @{stream.host?.username}
                </Link>
              </div>
            </div>

            <button
              onClick={() => setIsReportOpen(true)}
              aria-label="Report live stream"
              className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-850 hover:bg-zinc-800 transition-colors"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Chat Panel */}
        <div className="lg:col-span-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col h-[500px] overflow-hidden">
          <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-rose-500" />
              Live Chat
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">Real-time room</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className="leading-relaxed">
                <span className="font-bold text-zinc-400 mr-2">@{msg.user}:</span>
                <span className="text-zinc-200">{msg.text}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-zinc-950/80 border-t border-zinc-800 flex items-center gap-2">
            <input
              type="text"
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              placeholder="Send a chat message..."
              maxLength={200}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-full px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
            />
            <button
              type="submit"
              disabled={!inputChat.trim()}
              aria-label="Send live chat message"
              className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetType="live_stream"
        targetId={stream.id}
        targetTitle={stream.title}
      />
    </div>
  );
};
