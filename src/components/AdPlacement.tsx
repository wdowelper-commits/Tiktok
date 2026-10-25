/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Megaphone, ExternalLink, ShieldAlert } from 'lucide-react';

interface AdPlacementProps {
  placementId?: string;
  format?: 'feed_card' | 'banner' | 'sidebar';
}

/**
 * AdPlacement component conforming to PRD Section 4 & TRD Section 10:
 * "Include documented ad-placement components and configurable placement locations.
 * Do not display fake ads as real paid advertisements. Ad-network integration remains
 * pending until a provider, account, consent flow, and approved SDK/API are configured.
 * Advertising failures must not prevent normal video playback."
 */
export const AdPlacement: React.FC<AdPlacementProps> = ({ placementId = 'v1_feed_banner', format = 'banner' }) => {
  if (format === 'sidebar') {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-xs text-zinc-400 space-y-2">
        <div className="flex items-center justify-between text-zinc-500 font-medium">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
            <Megaphone className="w-3 h-3 text-amber-500" />
            Ad Placement ({placementId})
          </span>
          <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">v1 Standby</span>
        </div>
        <p className="text-zinc-400">
          Reserved compliant ad slot. Real-time ads activate upon network SDK initialization & consent validation.
        </p>
      </div>
    );
  }

  return (
    <div className="my-3 mx-auto w-full max-w-md bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 text-left transition-all">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/20">
            <Megaphone className="w-3 h-3" />
            Sponsored Slot
          </span>
          <span className="text-zinc-500 text-xs">Slot #{placementId}</span>
        </div>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Pending Network Setup</span>
      </div>
      <p className="text-xs text-zinc-300 leading-relaxed">
        Ad network integration slot configured for v1. No fabricated impressions are emitted until provider credentials and user consent flows are enabled.
      </p>
    </div>
  );
};
