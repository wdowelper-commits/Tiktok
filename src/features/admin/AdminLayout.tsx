/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, AlertTriangle, Film, Users, Settings, ArrowLeft, FileText } from 'lucide-react';
import { useRouter, Link } from '../../app/Router';
import { useAuth } from '../auth/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentPath, navigate } = useRouter();
  const { user, isStaff, isSuperAdmin, demoRole, setDemoRole } = useAuth();

  if (!isStaff) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Shield className="w-14 h-14 text-rose-500 mx-auto" />
        <h1 className="text-xl font-bold text-white">Access Restricted</h1>
        <p className="text-xs text-zinc-400 max-w-md">
          The administration portal is restricted to authorized Staff and Super Admin accounts via PostgreSQL Row Level Security.
        </p>
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl max-w-sm w-full space-y-3">
          <p className="text-xs text-zinc-300 font-semibold">Testing Role Simulator</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDemoRole('staff')}
              className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
            >
              Simulate Staff
            </button>
            <button
              onClick={() => setDemoRole('super_admin')}
              className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
            >
              Simulate Super Admin
            </button>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-xs text-zinc-400 hover:text-white"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', path: '/admin', icon: Shield },
    { label: 'Reports Queue', path: '/admin/reports', icon: AlertTriangle },
    { label: 'Video Moderation', path: '/admin/videos', icon: Film },
    { label: 'User Roles', path: '/admin/users', icon: Users },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-extrabold text-white">ShortVideo Administration</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {isSuperAdmin ? 'Super Admin' : 'Staff'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Server-verified moderation, audit trails, and role management
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public App
        </button>
      </div>

      {/* Admin Subnav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/admin'
              ? currentPath === '/admin'
              : currentPath.startsWith(item.path);

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Admin Content Area */}
      <div className="bg-zinc-950/80 border border-zinc-850 rounded-3xl p-6 min-h-[480px]">
        {children}
      </div>
    </div>
  );
};
