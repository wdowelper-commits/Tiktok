/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Users, Shield, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';
import { DEMO_PROFILES } from '../../lib/mockData';
import { useAuth } from '../auth/AuthContext';
import { Profile, RoleType } from '../../types';

export const AdminUsersView: React.FC = () => {
  const { isSuperAdmin } = useAuth();

  // Initial user roles map
  const [userRoles, setUserRoles] = useState<Record<string, RoleType[]>>({
    'user-maya': ['staff'],
    'user-alex': [],
    'user-urban': [],
    'user-tech': [],
    'user-sarah': [],
    'current-user': ['staff', 'super_admin'],
  });

  const [notification, setNotification] = useState<string | null>(null);

  const handleToggleStaff = (userId: string) => {
    if (!isSuperAdmin) {
      setNotification('Staff accounts cannot assign or revoke roles. Super Admin required.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const current = userRoles[userId] || [];
    const hasStaff = current.includes('staff');

    const updated = hasStaff ? current.filter((r) => r !== 'staff') : [...current, 'staff' as RoleType];

    setUserRoles((prev) => ({ ...prev, [userId]: updated }));
    setNotification(`Updated roles for user ${userId}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            User & Role Management
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Database-backed role assignment restricted strictly to Super Admin
          </p>
        </div>

        {!isSuperAdmin && (
          <div className="bg-amber-950/20 border border-amber-800/40 px-3 py-1.5 rounded-xl text-xs text-amber-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Role updates locked (Super Admin permission required)</span>
          </div>
        )}
      </div>

      {notification && (
        <div className="bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-xs text-white">
          {notification}
        </div>
      )}

      <div className="overflow-x-auto border border-zinc-850 rounded-2xl">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-900 text-[10px] uppercase text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Assigned Roles</th>
              <th className="py-3 px-4">Joined</th>
              <th className="py-3 px-4 text-right">Role Authorization</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {Object.values(DEMO_PROFILES).map((p) => {
              const roles = userRoles[p.id] || [];
              const hasStaff = roles.includes('staff');
              const hasSuperAdmin = roles.includes('super_admin');

              return (
                <tr key={p.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatar_path || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border border-zinc-700"
                      />
                      <div>
                        <span className="font-semibold text-white block">{p.display_name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">UUID: {p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-zinc-300">@{p.username}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5">
                      {hasSuperAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          Super Admin
                        </span>
                      )}
                      {hasStaff && !hasSuperAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Staff
                        </span>
                      )}
                      {!hasStaff && !hasSuperAdmin && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] text-zinc-500 bg-zinc-800">
                          User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-zinc-400">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {!hasSuperAdmin ? (
                      <button
                        onClick={() => handleToggleStaff(p.id)}
                        disabled={!isSuperAdmin}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                          hasStaff
                            ? 'bg-rose-600/20 hover:bg-rose-600/40 text-rose-400 border border-rose-500/30'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                      >
                        {hasStaff ? 'Revoke Staff' : 'Grant Staff'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic pr-2">Protected Root</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
