/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { DEMO_REPORTS } from '../../lib/mockData';
import { Report, ReportStatus, ReportTargetType } from '../../types';
import { useRouter } from '../../app/Router';

export const AdminReportsView: React.FC = () => {
  const { navigate } = useRouter();
  const [reports, setReports] = useState<Report[]>(DEMO_REPORTS);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const handleUpdateStatus = (reportId: string, nextStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status: nextStatus,
              reviewed_at: new Date().toISOString(),
            }
          : r
      )
    );
    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) => (prev ? { ...prev, status: nextStatus } : null));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            Moderation Reports Queue
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Community submitted violations across videos, comments, profiles, and messages
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses ({reports.length})</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="overflow-x-auto border border-zinc-850 rounded-2xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-[10px] uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">Target Label / ID</th>
              <th className="py-3 px-4">Target Type</th>
              <th className="py-3 px-4">Report Reason</th>
              <th className="py-3 px-4">Reporter</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-zinc-500">
                  No reports match filter criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((rep) => (
                <tr key={rep.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                    {rep.target_label || rep.target_id}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-mono text-zinc-400">
                    {rep.target_type}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="line-clamp-1">{rep.reason}</p>
                    {rep.details && (
                      <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{rep.details}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">@{rep.reporter?.username || 'user'}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        rep.status === 'open'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : rep.status === 'reviewing'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : rep.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {rep.status !== 'reviewing' && rep.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(rep.id, 'reviewing')}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Review
                        </button>
                      )}
                      {rep.status !== 'resolved' && (
                        <button
                          onClick={() => handleUpdateStatus(rep.id, 'resolved')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg text-[11px] font-semibold transition-colors"
                        >
                          Resolve
                        </button>
                      )}
                      {rep.status !== 'dismissed' && (
                        <button
                          onClick={() => handleUpdateStatus(rep.id, 'dismissed')}
                          className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-[11px] transition-colors"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
