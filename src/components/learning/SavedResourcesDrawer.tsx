'use client';

import React, { useState } from 'react';
import { ILearningResource } from '@/types/learning';

interface SavedResourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedResources: ILearningResource[];
  onRemoveSaved: (id: string) => void;
  onSelectResource: (resource: ILearningResource) => void;
}

export default function SavedResourcesDrawer({
  isOpen,
  onClose,
  savedResources,
  onRemoveSaved,
  onSelectResource,
}: SavedResourcesDrawerProps): React.JSX.Element | null {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'learning_hub_saved_drawer',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync library');

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Subscription failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-drawer-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full overflow-y-auto flex flex-col justify-between shadow-2xl p-6 sm:p-7 text-slate-100 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">🔖</span>
              <div>
                <h3 id="saved-drawer-title" className="text-lg font-bold text-white">
                  My Saved Protocol ({savedResources.length})
                </h3>
                <p className="text-[11px] text-slate-400">Quick-reference evidence library</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Lead Magnet Sync Banner */}
          <div className="bg-gradient-to-br from-teal-950/60 to-indigo-950/60 border border-teal-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">⚡</span>
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-300">
                Sync Library Across Devices
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Save your curated protocol to your email and receive our weekly 3-minute research recap on reversing insulin resistance.
            </p>

            {isSuccess ? (
              <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-xl text-xs text-emerald-200 font-bold">
                ✓ Protocol synced! Check your inbox for your confirmation and research digest.
              </div>
            ) : (
              <form onSubmit={handleSyncSubmit} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {submitting ? '...' : 'Sync'}
                  </button>
                </div>
                {errorMsg && <p className="text-[10px] text-rose-400">{errorMsg}</p>}
              </form>
            )}
          </div>

          {/* Saved Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Saved Items
            </h4>

            {savedResources.length === 0 ? (
              <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-3xl">📂</span>
                <p className="text-xs text-slate-400 font-medium">Your library is currently empty.</p>
                <p className="text-[11px] text-slate-500">
                  Click the &quot;Save&quot; ribbon on any video, article, or study to pin it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {savedResources.map((item) => (
                  <div
                    key={item._id}
                    className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div
                      className="space-y-1 flex-1 cursor-pointer"
                      onClick={() => onSelectResource(item)}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-bold uppercase">
                        <span>{item.type}</span>
                        <span>•</span>
                        <span className="truncate max-w-[150px]">{item.authorityName}</span>
                      </div>
                      <h5 className="text-xs font-bold text-white line-clamp-2 hover:text-teal-300">
                        {item.title}
                      </h5>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveSaved(item._id!)}
                      aria-label="Remove item"
                      className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-xl transition-colors"
          >
            Close Library
          </button>
        </div>
      </div>
    </div>
  );
}
