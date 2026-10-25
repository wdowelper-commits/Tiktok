/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Film, Database, Search, ShieldCheck } from 'lucide-react';
import { DesktopSidebar } from './DesktopSidebar';
import { BottomNavigation } from './BottomNavigation';
import { SupabaseSetupModal } from './SupabaseSetupModal';
import { useRouter, Link } from '../app/Router';
import { useAuth } from '../features/auth/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const { currentPath, navigate } = useRouter();
  const { user, isStaff, isSuperAdmin, demoRole } = useAuth();
  const isConfigured = isSupabaseConfigured();

  const isFeedPage = currentPath === '/';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <DesktopSidebar onOpenSetupModal={() => setIsSetupOpen(true)} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen pb-16 md:pb-0 relative overflow-x-hidden">
        {/* Top Header (visible on mobile, and simplified on desktop) */}
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-zinc-900 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight">ShortVideo</span>
            </Link>

            {/* In feed page on mobile, show For You / Following tabs */}
            {isFeedPage && (
              <div className="flex items-center gap-3 text-xs font-semibold ml-2">
                <button className="text-white border-b-2 border-white pb-0.5">For You</button>
                <button
                  onClick={() => navigate('/search')}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Following
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Supabase status indicator badge */}
            <button
              onClick={() => setIsSetupOpen(true)}
              aria-label="Supabase backend connection settings"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
                isConfigured
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-400 hover:bg-emerald-900/50'
                  : 'bg-amber-950/40 border-amber-800 text-amber-400 hover:bg-amber-900/50'
              }`}
            >
              <Database className="w-3 h-3" />
              <span className="hidden sm:inline">
                {isConfigured ? 'Supabase Active' : `Demo: ${demoRole}`}
              </span>
              <span className="sm:hidden">{isConfigured ? 'Live' : demoRole}</span>
            </button>

            {/* Search shortcut button */}
            <Link
              href="/search"
              aria-label="Search ShortVideo"
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-850 transition-colors"
            >
              <Search className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 flex flex-col relative w-full">{children}</main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* Supabase & Role Setup Modal */}
      <SupabaseSetupModal isOpen={isSetupOpen} onClose={() => setIsSetupOpen(false)} />
    </div>
  );
};
