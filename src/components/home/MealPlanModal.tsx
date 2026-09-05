'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface MealPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * High-Converting Filipino Meal Plan Lead Magnet Modal Component.
 *
 * @usecase Captures emails from Stage 2 roadmaps in exchange for the Filipino Diabetes Meal Plan, then seamlessly guides them to create their free GlycoSense account.
 * @param {MealPlanModalProps} props Component props controlling visibility and dismissal.
 * @dependencies React hooks, Next.js Link, fetch POST /api/v1/subscribe.
 * @returns {JSX.Element | null} Rendered Modal or null when closed.
 */
export default function MealPlanModal({ isOpen, onClose }: MealPlanModalProps): React.JSX.Element | null {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), firstName: firstName.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit opt-in. Please try again.');
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Something went wrong. Please check your email and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-16 h-16 bg-teal-500/20 text-teal-300 rounded-full flex items-center justify-center mx-auto text-3xl border border-teal-400/40">
              🎉
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">Your Meal Plan is on its way to your inbox!</h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                While you wait, your free GlycoSense tracking dashboard account has been generated below to help you track these meals and discover your personal food triggers.
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="#campaign"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Go to My Free GlycoSense Dashboard</span>
                <span>➔</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2 text-center sm:text-left">
              <span className="inline-block bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-teal-400/30">
                🍱 Free Filipino Meal Plan Guide
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Where should we send your Filipino Diabetes-Friendly Meal Plan?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Get the complete 7-day low-glycemic Filipino meal plan with local dish swaps, staple replacements, and portion guides sent directly to your inbox.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  First Name (Optional)
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Juan"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              <div>
                <label htmlFor="modalEmail" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  id="modalEmail"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
                />
              </div>

              {status === 'error' && (
                <div className="p-3 bg-rose-900/40 border border-rose-500/40 rounded-xl text-xs text-rose-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-4 px-6 bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 font-black text-base rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>{status === 'submitting' ? 'Sending Meal Plan...' : 'Send Me the Free Meal Plan & Guide'}</span>
                <span>➔</span>
              </button>

              <p className="text-[11px] text-slate-400 text-center">
                🔒 100% Free &amp; Private. We will never share your email.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
