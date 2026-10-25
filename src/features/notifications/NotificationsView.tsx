/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Check, Lock } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from '../../app/Router';
import { DEMO_NOTIFICATIONS } from '../../lib/mockData';
import { Notification } from '../../types';

export const NotificationsView: React.FC = () => {
  const { user } = useAuth();
  const { navigate } = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Lock className="w-12 h-12 text-rose-500 mx-auto" />
        <div>
          <h2 className="text-lg font-bold">Notifications</h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm">
            Sign in to check your social interactions, mentions, and updates.
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

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'comment':
        return <MessageCircle className="w-4 h-4 text-cyan-400 fill-cyan-400/20" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-white">Notifications</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Likes, comments, and new followers</p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Mark all as read</span>
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 space-y-2 bg-zinc-900/40 rounded-2xl border border-zinc-800 p-8">
          <Bell className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No notifications yet</h3>
          <p className="text-xs text-zinc-500">When creators interact with you, updates will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const isUnread = !notif.read_at;
            return (
              <div
                key={notif.id}
                className={`flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all ${
                  isUnread
                    ? 'bg-zinc-900 border-zinc-700/80 shadow-sm'
                    : 'bg-zinc-900/40 border-zinc-850 hover:bg-zinc-900/60'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      notif.actor?.avatar_path ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                    }
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center">
                    {getIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-xs">
                  <p className="text-zinc-200">
                    <span className="font-bold text-white">@{notif.actor?.username || 'user'}</span>{' '}
                    {notif.payload?.message || 'interacted with your content.'}
                  </p>
                  <span className="text-[10px] text-zinc-500 mt-1 block">
                    {new Date(notif.created_at).toLocaleDateString()} at{' '}
                    {new Date(notif.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                {isUnread && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
