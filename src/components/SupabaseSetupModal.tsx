/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, X, CheckCircle2, AlertTriangle, Key, ExternalLink, ShieldCheck, RefreshCw } from 'lucide-react';
import { isSupabaseConfigured, supabaseUrl, setCustomSupabaseCredentials } from '../lib/supabase';
import { useAuth } from '../features/auth/AuthContext';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({ isOpen, onClose }) => {
  const isConfigured = isSupabaseConfigured();
  const { demoRole, setDemoRole } = useAuth();

  const [customUrl, setCustomUrl] = useState(supabaseUrl);
  const [customKey, setCustomKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setCustomSupabaseCredentials(customUrl, customKey);
  };

  const handleClear = () => {
    setCustomSupabaseCredentials('', '');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          aria-label="Close setup modal"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <Database className="w-6 h-6 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold">Supabase Backend & Storage Status</h2>
            <p className="text-xs text-zinc-400">PostgreSQL, RLS Policies, and Storage Integration</p>
          </div>
        </div>

        {/* Current Connection Status */}
        <div className={`p-4 rounded-xl border mb-5 ${
          isConfigured
            ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300'
            : 'bg-amber-950/20 border-amber-800/50 text-amber-300'
        }`}>
          <div className="flex items-center gap-2 font-semibold text-xs mb-1">
            {isConfigured ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Live Supabase Connected
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Demo / Preview Mode Active
              </>
            )}
          </div>
          <p className="text-[11px] opacity-90 leading-relaxed">
            {isConfigured
              ? `Connected to: ${supabaseUrl}. Schema migrations ready in /supabase/migrations.`
              : 'Supabase credentials are not yet configured in environment variables. Full interactive demo mode with realistic videos, feeds, messaging, and role switching is active.'}
          </p>
        </div>

        {/* Role Switcher for Testing (PRD requirement for guest/user/staff/super_admin) */}
        <div className="bg-zinc-800/40 border border-zinc-800 rounded-xl p-4 mb-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              Role Simulator (Evaluation & Testing)
            </span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Client Switch</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {(['guest', 'user', 'staff', 'super_admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDemoRole(r)}
                className={`py-2 px-2.5 rounded-lg font-medium text-center transition-all ${
                  demoRole === r
                    ? 'bg-rose-600 text-white font-bold shadow-sm'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                }`}
              >
                {r === 'super_admin' ? 'Super Admin' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Connect Real Supabase Project */}
        <form onSubmit={handleSave} className="space-y-3">
          <h3 className="text-xs font-semibold text-zinc-300">Connect Your Supabase Project</h3>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">VITE_SUPABASE_URL</label>
            <input
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://xyzcompany.supabase.co"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">VITE_SUPABASE_PUBLISHABLE_KEY</label>
            <input
              type="password"
              value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {isConfigured && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-zinc-400 hover:text-rose-400"
              >
                Reset to Demo
              </button>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-900/30 transition-colors"
            >
              {isSaving ? 'Connecting...' : 'Apply Credentials'}
            </button>
          </div>
        </form>

        {/* Instructions summary */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
          <p className="font-semibold text-zinc-300">Included Migration:</p>
          <p className="font-mono text-zinc-500">supabase/migrations/20261025000000_initial_schema.sql</p>
          <p className="text-zinc-500">
            Apply via Supabase Dashboard SQL Editor or Supabase CLI (`supabase db push`).
          </p>
        </div>
      </div>
    </div>
  );
};
