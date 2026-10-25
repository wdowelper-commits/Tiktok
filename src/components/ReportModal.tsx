/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReportTargetType } from '../types';
import { useVideos } from '../features/videos/VideoContext';
import { useAuth } from '../features/auth/AuthContext';
import { useRouter } from '../app/Router';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
}

const REPORT_REASONS = [
  'Inappropriate or adult content',
  'Harassment or hate speech',
  'Dangerous stunts or self-harm',
  'Spam, misleading or scam',
  'Copyright or intellectual property violation',
  'Other policy violation',
];

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { createReport } = useVideos();

  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await createReport({
      target_type: targetType,
      target_id: targetId,
      reason: selectedReason,
      details: details.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          aria-label="Close report modal"
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold">Report Submitted</h3>
            <p className="text-sm text-zinc-400">
              Thank you for keeping our community safe. Our moderation staff will review this content.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-bold text-white">Report Content</h2>
            </div>

            {targetTitle && (
              <p className="text-xs text-zinc-400 bg-zinc-800/50 p-2.5 rounded-lg border border-zinc-800 line-clamp-1">
                Target: <span className="text-white font-medium">{targetTitle}</span> ({targetType})
              </p>
            )}

            {!user && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-300">
                You must be logged in to submit a report.
              </div>
            )}

            {errorMessage && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 text-xs text-rose-300">
                {errorMessage}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">Select reason</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {REPORT_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-xs cursor-pointer border transition-colors ${
                      selectedReason === reason
                        ? 'bg-rose-500/10 border-rose-500/50 text-white'
                        : 'bg-zinc-800/40 border-zinc-800 hover:bg-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={reason}
                      checked={selectedReason === reason}
                      onChange={() => setSelectedReason(reason)}
                      className="text-rose-500 focus:ring-rose-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide timestamps or specific context..."
                className="w-full bg-zinc-800/60 border border-zinc-700/80 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-900/30 transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
