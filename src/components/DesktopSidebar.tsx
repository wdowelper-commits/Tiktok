/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Film,
  Home,
  Compass,
  Radio,
  Bell,
  MessageSquare,
  Upload,
  User,
  Settings,
  Shield,
  Database,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useRouter, Link } from '../app/Router';
import { useAuth } from '../features/auth/AuthContext';
import { AdPlacement } from './AdPlacement';
import { isSupabaseConfigured } from '../lib/supabase';

interface DesktopSidebarProps {
  onOpenSetupModal: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ onOpenSetupModal }) => {
  const { currentPath } = useRouter();
  const { user, profile, isStaff, isSuperAdmin, signOut, demoRole } = useAuth();
  const isConfigured = isSupabaseConfigured();

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const navItemClass = (path: string) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
      isActive(path)
        ? 'bg-rose-500/10 text-rose-400 font-semibold'
        : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
    }`;

  const profileHref = user ? (profile?.username ? `/u/${profile.username}` : `/u/me`) : '/login';

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950 p-4 h-screen sticky top-0 overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-2 mb-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <Film className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              ShortVideo
            </span>
            <span className="block text-[10px] text-zinc-500 font-mono -mt-1">v1.0 • PWA ready</span>
          </div>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav aria-label="Main Navigation" className="space-y-1">
        <Link href="/" className={navItemClass('/')}>
          <Home className="w-4 h-4" />
          <span>For You</span>
        </Link>

        <Link href="/search" className={navItemClass('/search')}>
          <Compass className="w-4 h-4" />
          <span>Discover</span>
        </Link>

        <Link href="/live" className={navItemClass('/live')}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-rose-500" />
              <span>Live Streams</span>
            </div>
            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
              Live
            </span>
          </div>
        </Link>

        <Link href="/upload" className={navItemClass('/upload')}>
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Upload Video</span>
        </Link>

        <Link href="/notifications" className={navItemClass('/notifications')}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
        </Link>

        <Link href="/inbox" className={navItemClass('/inbox')}>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            <span className="text-[11px] font-semibold bg-zinc-800 text-zinc-300 px-1.5 py-0.2 rounded-full">
              2
            </span>
          </div>
        </Link>
      </nav>

      {/* Separator */}
      <div className="my-4 border-t border-zinc-800/80" />

      {/* Account / Admin section */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
          Account & Controls
        </div>

        {user ? (
          <>
            <Link href={profileHref} className={navItemClass('/u')}>
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </Link>

            <Link href="/settings" className={navItemClass('/settings')}>
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </Link>

            {isStaff && (
              <Link href="/admin" className={navItemClass('/admin')}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3 text-amber-400">
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">Admin Panel</span>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-1.5 py-0.5 rounded">
                    {isSuperAdmin ? 'Super' : 'Staff'}
                  </span>
                </div>
              </Link>
            )}

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-zinc-500 hover:text-rose-400 hover:bg-zinc-900/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In / Register</span>
          </Link>
        )}
      </div>

      {/* Backend Status Widget */}
      <div className="mt-auto pt-4 space-y-3">
        <button
          onClick={onOpenSetupModal}
          className="w-full bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 p-3 rounded-xl text-left transition-colors group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-300">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              Supabase Status
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
              }`}
            />
          </div>
          <p className="text-[11px] text-zinc-500 group-hover:text-zinc-400">
            {isConfigured ? 'Connected to PostgreSQL' : `Demo Mode (${demoRole})`}
          </p>
        </button>

        {/* Compliant Ad Placement Slot */}
        <AdPlacement format="sidebar" placementId="desktop_sidebar_slot" />
      </div>
    </aside>
  );
};
