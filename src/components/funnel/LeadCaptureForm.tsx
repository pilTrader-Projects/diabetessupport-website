'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CAMPAIGN_CODES } from '@/config/leadConfig';

interface LeadCaptureFormProps {
  symptomsChecked?: string[];
  source: string;
}

/**
 * Lead Capture Form Component for the Insulin Reset Protocol.
 *
 * @usecase Captures firstName and email in compliance with RA 10173 using the site's signature GlycoSense brand panel styling.
 * @param {LeadCaptureFormProps} props Checked symptoms from interactive checklist and funnel source tag.
 * @returns {JSX.Element} Rendered opt-in form with compliance guarantee.
 */
export default function LeadCaptureForm({
  symptomsChecked = [],
  source,
}: LeadCaptureFormProps): React.JSX.Element {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!source || !source.trim()) {
      setErrorMessage('Campaign source configuration is missing.');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || undefined,
          email: cleanEmail,
          symptomsChecked,
          source,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit form. Please check your details and try again.');
      }

      // Immediately redirect to the high-converting Bridge / Upsell Page
      router.push(data.redirectUrl || '/reset-success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      id="lead-form"
      className="scroll-mt-12 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-white/20 bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel"
    >
      <div className="space-y-3 text-center max-w-xl mx-auto mb-8">
        <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
          🎁 Instant Free Download
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Claim Your Free 8-Page Guide: &ldquo;The Hidden Metabolic Clock&rdquo;
        </h3>
        <p className="text-sm text-purple-100 max-w-lg mx-auto leading-relaxed">
          Where should we send your report? Enter your best email below for immediate access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label htmlFor="first-name-input" className="block text-xs font-bold text-purple-100 uppercase tracking-wider mb-1.5">
            First Name <span className="text-purple-200 font-normal">(Optional)</span>
          </label>
          <input
            id="first-name-input"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="e.g. Maria"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full min-h-[48px] px-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm border border-white/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label htmlFor="email-input" className="block text-xs font-bold text-purple-100 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-amber-300">*</span>
          </label>
          <input
            id="email-input"
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[48px] px-4 py-3 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm border border-white/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 bg-rose-950/80 border border-rose-400/60 rounded-xl text-xs text-rose-200 font-semibold text-center animate-fadeIn">
            ⚠️ {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[52px] bg-white hover:bg-slate-100 text-blue-900 font-black text-base py-3.5 px-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 border border-white"
        >
          {loading ? (
            <span>Sending Your 8-Page Guide...</span>
          ) : (
            <>
              <span>Send Me The Free 8-Page Guide</span>
              <span className="text-xl">➔</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] sm:text-xs text-purple-100 flex items-center justify-center gap-1.5 pt-2">
          <span>🔒</span>
          <span>100% Privacy Guaranteed under RA 10173. Safe, encrypted, and never shared.</span>
        </p>
      </form>
    </div>
  );
}
