'use client';

import React, { useState } from 'react';

export interface KitOptInFormProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  layout?: 'card' | 'inline' | 'hero';
  source?: string;
}

/**
 * Interactive Kit (ConvertKit) Lead Capture Opt-In Form Component.
 *
 * @usecase Captures subscriber email and first name for email campaigns, newsletter signups, and lead magnets.
 * @param {KitOptInFormProps} props UI customization parameters.
 * @dependencies /api/v1/subscribe REST API endpoint.
 * @returns {JSX.Element} Rendered opt-in form element.
 */
export default function KitOptInForm({
  title = 'Get Our Free Diabetes Care & Insulin Sensitivity Guide',
  subtitle = 'Join over 15,000+ individuals receiving evidence-based lifestyle tips, low-GI meal plans, and blood sugar tracking advice directly in their inbox.',
  buttonText = 'Claim Free Guide',
  layout = 'card',
  source = 'general_optin',
}: KitOptInFormProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, source }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to submit form. Please try again.');
      } else {
        setSuccessMsg(data.message || 'Thank you for subscribing! Check your inbox for your guide.');
        setEmail('');
        setFirstName('');
      }
    } catch {
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (layout === 'inline') {
    return (
      <div className="w-full bg-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-lg space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
          <p className="text-sm text-teal-100">{subtitle}</p>
        </div>

        {successMsg ? (
          <div className="p-4 bg-teal-800/80 border border-teal-500 rounded-xl text-teal-100 text-sm font-semibold animate-fadeIn">
            🎉 {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="First Name (Optional)"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="px-4 py-3 bg-teal-950/60 border border-teal-700/60 rounded-xl text-sm text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-teal-950/60 border border-teal-700/60 rounded-xl text-sm text-white placeholder-teal-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {loading ? 'Submitting...' : buttonText}
            </button>
          </form>
        )}

        {errorMsg && (
          <p className="text-xs font-semibold text-rose-300 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/50">
            ⚠️ {errorMsg}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-900 via-teal-850 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-teal-800 space-y-6">
      <div className="space-y-2 text-center sm:text-left">
        <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-extrabold uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-400/30">
          🎁 Free Downloadable Resource
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-teal-100/90 leading-relaxed max-w-2xl">
          {subtitle}
        </p>
      </div>

      {successMsg ? (
        <div className="p-6 bg-teal-800/90 border border-teal-400/50 rounded-2xl text-center space-y-2">
          <span className="text-3xl">🎉</span>
          <h4 className="text-lg font-extrabold text-white">Check Your Inbox!</h4>
          <p className="text-sm text-teal-100">{successMsg}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
                First Name
              </label>
              <input
                type="text"
                placeholder="e.g. Maria"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-teal-700/60 rounded-xl text-sm text-white placeholder-teal-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-teal-200 uppercase tracking-wider mb-1">
                Email Address <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/50 border border-teal-700/60 rounded-xl text-sm text-white placeholder-teal-400/60 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Submitting...</span>
            ) : (
              <>
                <span>{buttonText}</span>
                <span className="text-lg">&rarr;</span>
              </>
            )}
          </button>

          <p className="text-center text-xs text-teal-200/70">
            🔒 100% Privacy Guaranteed. Unsubscribe at any time with 1-click.
          </p>
        </form>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-950/60 border border-rose-700/60 rounded-xl text-xs text-rose-200 font-semibold text-center">
          ⚠️ {errorMsg}
        </div>
      )}
    </div>
  );
}
