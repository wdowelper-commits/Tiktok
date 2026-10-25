/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Settings, Save, ShieldAlert, Image as ImageIcon, Plus, Check } from 'lucide-react';
import { DEMO_SETTINGS, DEMO_BANNERS } from '../../lib/mockData';
import { useAuth } from '../auth/AuthContext';
import { Banner } from '../../types';
import { validateSafeUrl } from '../../lib/validation/rules';

export const AdminSettingsView: React.FC = () => {
  const { isSuperAdmin } = useAuth();

  const [settings, setSettings] = useState(DEMO_SETTINGS);
  const [banners, setBanners] = useState<Banner[]>(DEMO_BANNERS);

  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);

    const safeUrlCheck = validateSafeUrl(bannerUrl);
    if (!safeUrlCheck.valid) {
      setBannerError(safeUrlCheck.error || 'Invalid URL');
      return;
    }

    const newBanner: Banner = {
      id: `ban-${Date.now()}`,
      title: bannerTitle.trim(),
      image_path: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
      target_url: bannerUrl.trim() || null,
      is_active: true,
      starts_at: new Date().toISOString(),
      ends_at: null,
      created_by: 'current-user',
      created_at: new Date().toISOString(),
    };

    setBanners((prev) => [newBanner, ...prev]);
    setBannerTitle('');
    setBannerUrl('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-purple-400" />
          Platform Settings & Banner Operations
        </h2>
        <p className="text-xs text-zinc-400 mt-0.5">
          Global video limits, moderation policy, and promotional banners
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="bg-amber-950/20 border border-amber-800/40 p-4 rounded-2xl text-xs text-amber-300 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>
            Platform settings are read-only for Staff accounts. Only Super Admin can mutate settings rows in PostgreSQL.
          </span>
        </div>
      )}

      {savedNotice && (
        <div className="bg-emerald-950/20 border border-emerald-800 p-3 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Platform settings updated successfully in platform_settings table.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">
            Upload & Content Limits
          </h3>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Max Upload Size (MB)
            </label>
            <input
              type="number"
              disabled={!isSuperAdmin}
              value={settings.max_upload_size_mb}
              onChange={(e) =>
                setSettings({ ...settings, max_upload_size_mb: parseInt(e.target.value) || 200 })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Max Video Duration (Seconds)
            </label>
            <input
              type="number"
              disabled={!isSuperAdmin}
              value={settings.max_video_duration_seconds}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  max_video_duration_seconds: parseInt(e.target.value) || 300,
                })
              }
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Moderation Flow</label>
            <select
              disabled={!isSuperAdmin}
              value={settings.moderation_mode}
              onChange={(e) => setSettings({ ...settings, moderation_mode: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              <option value="instant_publish_with_post_moderation">
                Instant Publish (Post-moderation via Reports) [v1 Approved]
              </option>
              <option value="require_pre_approval">Manual Pre-Approval</option>
            </select>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">Access Policies</h3>

          <div className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-white block">Allow Guest Browsing</span>
              <span className="text-[11px] text-zinc-400">Public feed and video discovery without login</span>
            </div>
            <input
              type="checkbox"
              disabled={!isSuperAdmin}
              checked={settings.allow_guest_browsing}
              onChange={(e) =>
                setSettings({ ...settings, allow_guest_browsing: e.target.checked })
              }
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-zinc-800/40 rounded-xl">
            <div>
              <span className="text-xs font-semibold text-white block">Require Email Verification</span>
              <span className="text-[11px] text-zinc-400">Users must confirm email before publishing</span>
            </div>
            <input
              type="checkbox"
              disabled={!isSuperAdmin}
              checked={settings.require_email_verification}
              onChange={(e) =>
                setSettings({ ...settings, require_email_verification: e.target.checked })
              }
              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={!isSuperAdmin}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-900/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Platform Settings</span>
            </button>
          </div>
        </div>
      </form>

      {/* Promotional Banners Management */}
      <div className="space-y-4 pt-4 border-t border-zinc-850">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-purple-400" />
            Promotional Banners
          </h3>
          <span className="text-xs text-zinc-500">Only verified URLs accepted</span>
        </div>

        {bannerError && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300">
            {bannerError}
          </div>
        )}

        <form onSubmit={handleCreateBanner} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            placeholder="Banner title..."
            required
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <input
            type="text"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            placeholder="Target URL or /path..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Banner</span>
          </button>
        </form>

        <div className="space-y-2">
          {banners.map((ban) => (
            <div
              key={ban.id}
              className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs"
            >
              <div>
                <span className="font-bold text-white block">{ban.title}</span>
                <span className="text-[11px] text-zinc-400 font-mono">
                  Target: {ban.target_url || 'Internal'}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400">
                Active
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
