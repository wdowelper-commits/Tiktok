/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageSquare, Lock, Search, PlusCircle } from 'lucide-react';
import { useRouter, Link } from '../../app/Router';
import { useAuth } from '../auth/AuthContext';
import { DEMO_CONVERSATIONS } from '../../lib/mockData';
import { Conversation } from '../../types';

export const InboxView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [conversations] = useState<Conversation[]>(DEMO_CONVERSATIONS);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold">Inbox is Private</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Please sign in to view your direct messages and chat with creators.
          </p>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-900/30 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Direct Messages</h1>
          <p className="text-xs text-zinc-400 mt-0.5">End-to-end conversation membership enforcement</p>
        </div>
      </div>

      {conversations.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
          <MessageSquare className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No messages yet</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Visit creator profiles to start private one-to-one conversations.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => {
            // Find participant other than current user
            const otherMember = conv.members?.find((m) => m.id !== user.id) || conv.members?.[0];

            return (
              <Link
                key={conv.id}
                href={`/messages/${conv.id}`}
                className="flex items-center gap-3.5 p-3.5 bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800/80 rounded-2xl transition-all group"
              >
                <div className="relative">
                  <img
                    src={
                      otherMember?.avatar_path ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={otherMember?.username || 'User'}
                    className="w-12 h-12 rounded-full object-cover border border-zinc-700"
                  />
                  {(conv.unread_count || 0) > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-black" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-bold text-xs sm:text-sm text-white group-hover:text-rose-400 transition-colors">
                      @{otherMember?.username || 'user'}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {conv.last_message
                        ? new Date(conv.last_message.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-1 leading-normal">
                    {conv.last_message?.body || 'No messages in this conversation'}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
