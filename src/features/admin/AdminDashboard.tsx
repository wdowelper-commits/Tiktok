/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Film, AlertTriangle, Users, Image as ImageIcon, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { DEMO_REPORTS, DEMO_AUDIT_LOGS, DEMO_PROFILES, DEMO_BANNERS } from '../../lib/mockData';
import { useVideos } from '../videos/VideoContext';
import { useRouter, Link } from '../../app/Router';

export const AdminDashboard: React.FC = () => {
  const { videos } = useVideos();
  const { navigate } = useRouter();

  const openReports = DEMO_REPORTS.filter((r) => r.status === 'open' || r.status === 'reviewing');

  const stats = [
    { label: 'Published Videos', count: videos.length, icon: Film, color: 'text-cyan-400', href: '/admin/videos' },
    { label: 'Pending Reports', count: openReports.length, icon: AlertTriangle, color: 'text-amber-400', href: '/admin/reports' },
    { label: 'Active Users', count: Object.keys(DEMO_PROFILES).length, icon: Users, color: 'text-emerald-400', href: '/admin/users' },
    { label: 'Promoted Banners', count: DEMO_BANNERS.length, icon: ImageIcon, color: 'text-purple-400', href: '/admin/settings' },
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-zinc-900/60 hover:bg-zinc-900 border border-zinc-800 p-4 rounded-2xl transition-all group"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color} group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">View</span>
              </div>
              <div className="text-2xl font-extrabold text-white">{stat.count}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      {/* Reports Queue Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">High Priority Moderation Reports</h2>
          </div>
          <Link href="/admin/reports" className="text-xs text-amber-400 hover:underline font-semibold">
            Open full queue ({DEMO_REPORTS.length})
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/80 text-[10px] uppercase text-zinc-500 border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">Target</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850">
              {DEMO_REPORTS.slice(0, 3).map((rep) => (
                <tr key={rep.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-white max-w-xs truncate">
                    {rep.target_label || rep.target_id}
                  </td>
                  <td className="py-3 px-3 uppercase text-[10px] font-mono text-zinc-400">
                    {rep.target_type}
                  </td>
                  <td className="py-3 px-3 text-zinc-300">{rep.reason}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                        rep.status === 'open'
                          ? 'bg-rose-500/20 text-rose-400'
                          : rep.status === 'reviewing'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <Link
                      href="/admin/reports"
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Audit Logs */}
      <div className="space-y-4 pt-4 border-t border-zinc-850">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          <h2 className="text-sm font-bold text-white">Recent Administrative Audit Logs</h2>
        </div>

        <div className="space-y-2">
          {DEMO_AUDIT_LOGS.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl text-xs"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="font-semibold text-white">@{log.actor?.username || 'system'}</span>
                  <span className="text-zinc-400"> performed action </span>
                  <code className="text-rose-400 font-mono bg-zinc-800 px-1 py-0.5 rounded text-[10px]">
                    {log.action}
                  </code>
                </div>
              </div>
              <span className="text-[10px] text-zinc-500">
                {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
