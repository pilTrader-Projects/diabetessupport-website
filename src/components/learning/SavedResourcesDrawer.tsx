'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ILearningResource } from '@/types/learning';
import {
  ISavedProtocolSummary,
  getSavedProtocolItems,
  removeSavedProtocolResource,
} from '@/lib/savedProtocolUtils';

interface SavedResourcesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedResources?: (ILearningResource | ISavedProtocolSummary)[];
  onRemoveSaved?: (id: string) => void;
  onSelectResource?: (resource: any) => void;
}

export default function SavedResourcesDrawer({
  isOpen,
  onClose,
  savedResources: propResources,
  onRemoveSaved,
  onSelectResource,
}: SavedResourcesDrawerProps): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [localItems, setLocalItems] = useState<ISavedProtocolSummary[]>([]);

  useEffect(() => {
    setMounted(true);
    // Pre-fill email from previous signups if available
    try {
      const storedEmail =
        localStorage.getItem('user_email') ||
        localStorage.getItem('subscriber_email') ||
        localStorage.getItem('lead_email');
      if (storedEmail) setEmail(storedEmail);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      // Load fallback saved items from localStorage cache
      setLocalItems(getSavedProtocolItems());
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Use props if provided and populated, otherwise fallback to local cache
  const activeItems = (propResources && propResources.length > 0)
    ? propResources
    : localItems;

  const handleRemove = (id: string) => {
    if (onRemoveSaved) {
      onRemoveSaved(id);
    } else {
      removeSavedProtocolResource(id);
    }
    setLocalItems((prev) => prev.filter((item) => item._id !== id));
  };

  const handleSelect = (item: any) => {
    if (onSelectResource) {
      onSelectResource(item);
    } else if (typeof window !== 'undefined') {
      window.location.href = `/blog?play=${item._id}`;
    }
  };

  const handleShareProtocol = () => {
    if (typeof window === 'undefined') return;
    const ids = activeItems.map((r) => r._id).filter(Boolean);
    const shareUrl = `${window.location.origin}/blog?saved=${ids.join(',')}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }).catch(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

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
          metadata: {
            savedResourceCount: activeItems.length,
            savedResourceIds: activeItems.map((r) => r._id),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync library');

      // Persist email in local storage for future seamless autofill
      try {
        localStorage.setItem('user_email', email.trim());
      } catch {
        // ignore
      }

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Subscription failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const drawerContent = (
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
                <h3 id="saved-drawer-title" className="text-lg font-bold text-white flex items-center gap-2">
                  <span>My Saved Protocol</span>
                  <span className="bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs px-2 py-0.5 rounded-full font-black">
                    {activeItems.length}
                  </span>
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

          {/* Quick Actions (Share Protocol) */}
          {activeItems.length > 0 && (
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-[11px] text-slate-400">
                Share this curated collection:
              </span>
              <button
                type="button"
                onClick={handleShareProtocol}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <span>{copiedLink ? '✓ Copied Link!' : '🔗 Share Protocol'}</span>
              </button>
            </div>
          )}

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
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 font-sans"
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
              Saved Items ({activeItems.length})
            </h4>

            {activeItems.length === 0 ? (
              <div className="text-center py-12 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-3">
                <span className="text-3xl">📂</span>
                <p className="text-xs text-slate-400 font-medium">Your library is currently empty.</p>
                <p className="text-[11px] text-slate-500">
                  Click the &quot;Save&quot; ribbon on any video, article, or study to pin it here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {activeItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all group"
                  >
                    <div
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                      onClick={() => handleSelect(item)}
                    >
                      {item.thumbnailUrl ? (
                        <div className="w-14 h-14 shrink-0 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.thumbnailUrl}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      ) : (
                        <div className="w-14 h-14 shrink-0 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center justify-center text-lg text-teal-400">
                          {item.type === 'video' ? '🎬' : item.type === 'podcast' ? '🎙️' : item.type === 'study' ? '🔬' : '📖'}
                        </div>
                      )}

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-teal-400 font-bold uppercase">
                          <span>{item.type}</span>
                          {item.authorityName && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[140px] text-slate-400">{item.authorityName}</span>
                            </>
                          )}
                        </div>
                        <h5 className="text-xs font-bold text-white line-clamp-2 group-hover:text-teal-300 transition-colors">
                          {item.title}
                        </h5>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item._id!)}
                      aria-label="Remove item"
                      className="text-slate-500 hover:text-rose-400 p-2 rounded-xl hover:bg-slate-900 transition-colors shrink-0"
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

  if (mounted && typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return drawerContent;
}
