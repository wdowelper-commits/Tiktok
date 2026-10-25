/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, Compass, PlusSquare, MessageSquare, User } from 'lucide-react';
import { useRouter, Link } from '../app/Router';
import { useAuth } from '../features/auth/AuthContext';

export const BottomNavigation: React.FC = () => {
  const { currentPath } = useRouter();
  const { user, profile } = useAuth();

  const profileHref = user ? (profile?.username ? `/u/${profile.username}` : `/u/me`) : '/login';

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md border-t border-zinc-800/80 px-2 py-1 flex items-center justify-around safe-bottom"
    >
      <Link
        href="/"
        aria-label="Home Feed"
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
          isActive('/') ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Home</span>
      </Link>

      <Link
        href="/search"
        aria-label="Search and Discover"
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
          isActive('/search') ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Discover</span>
      </Link>

      <Link
        href="/upload"
        aria-label="Upload Video"
        className="flex items-center justify-center -mt-2 p-1 focus:outline-none"
      >
        <div className="w-11 h-8 rounded-xl bg-gradient-to-r from-cyan-400 via-rose-500 to-pink-500 p-[2px] flex items-center justify-center shadow-lg shadow-rose-900/30">
          <div className="w-full h-full bg-black rounded-[9px] flex items-center justify-center">
            <PlusSquare className="w-5 h-5 text-white" />
          </div>
        </div>
      </Link>

      <Link
        href="/inbox"
        aria-label="Inbox & Messages"
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors relative ${
          isActive('/inbox') || isActive('/messages') ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] mt-0.5 font-medium">Inbox</span>
        <span className="absolute top-1 right-3 w-2 h-2 rounded-full bg-rose-500" />
      </Link>

      <Link
        href={profileHref}
        aria-label="User Profile"
        className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors ${
          isActive('/u') || isActive('/login') ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
        }`}
      >
        {profile?.avatar_path ? (
          <img
            src={profile.avatar_path}
            alt="Profile"
            className={`w-5 h-5 rounded-full object-cover border ${
              isActive('/u') ? 'border-rose-500' : 'border-zinc-700'
            }`}
          />
        ) : (
          <User className="w-5 h-5" />
        )}
        <span className="text-[10px] mt-0.5 font-medium">Profile</span>
      </Link>
    </nav>
  );
};
