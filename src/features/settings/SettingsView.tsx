/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, User, Shield, Key, LogOut, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useRouter } from '../../app/Router';
import { isSupabaseConfigured } from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { user, profile, roles, updateProfile, signOut } = useAuth();
  const { navigate } = useRouter();
  const isConfigured = isSupabaseConfigured();

  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [savedNotice, setSavedNotice] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Settings className="w-12 h-12 text-zinc-600 mx-auto" />
        <h2 className="text-base font-bold text-white">Sign in to view settings</h2>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await updateProfile({
      display_name: displayName.trim() || undefined,
      bio: bio.trim() || undefined,
    });

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2500);
    }
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto w-full p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-white">Account Settings</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Manage your profile, identity, and security</p>
      </div>

      {savedNotice && (
        <div className="bg-emerald-950/20 border border-emerald-800 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved.</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Details Form */}
      <form onSubmit={handleSave} className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <User className="w-4 h-4 text-rose-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Public Profile</h2>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Username</label>
          <input
            type="text"
            disabled
            value={profile?.username || 'user'}
            className="w-full bg-zinc-800/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-400 font-mono"
          />
          <span className="text-[10px] text-zinc-500 mt-1 block">
            Usernames are permanent and unique identifiers.
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={60}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={250}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
          />
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-900/30 transition-colors"
        >
          Save Profile
        </button>
      </form>

      {/* Role and Permissions Info */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
          <Shield className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Account Role & Access
          </h2>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Database Role:</span>
          <span className="font-bold text-white uppercase px-2 py-0.5 rounded bg-zinc-800 border border-zinc-750">
            {roles.length > 0 ? roles.join(', ') : 'Standard User'}
          </span>
        </div>
        <p className="text-[11px] text-zinc-500 leading-relaxed">
          Privileged roles (staff and super_admin) are managed in PostgreSQL <code className="text-zinc-300">user_roles</code> and verified through Row Level Security.
        </p>
      </div>

      {/* Session Controls */}
      <div className="pt-2">
        <button
          onClick={signOut}
          className="w-full py-3 bg-zinc-900 hover:bg-rose-950/30 text-rose-400 border border-zinc-800 hover:border-rose-800/50 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of This Device</span>
        </button>
      </div>
    </div>
  );
};
