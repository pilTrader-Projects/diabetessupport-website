'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LeadCaptureFormProps {
  symptomsChecked?: string[];
  source?: string;
}

/**
 * Lead Capture Form Component for the Insulin Reset Protocol.
 *
 * @usecase Captures firstName and email in compliance with RA 10173 and immediately transitions the user to the /reset-success bridge upsell page.
 * @param {LeadCaptureFormProps} props Checked symptoms from interactive checklist and funnel source tag.
 * @returns {JSX.Element} Rendered opt-in form with compliance guarantee.
 */
export default function LeadCaptureForm({
  symptomsChecked = [],
  source = 'insulin_reset_landing_page',
}: LeadCaptureFormProps): React.JSX.Element {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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
      className="scroll-mt-12 rounded-3xl p-6 sm:p-10 text-white shadow-2xl border border-white/20 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950"
    >
      <div className="space-y-3 text-center max-w-xl mx-auto mb-8">
        <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-400/30">
          🎁 Instant Free Download
        </span>
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Claim Your Free 3-Page &ldquo;Hidden Clock&rdquo; Cheat Sheet
        </h3>
        <p className="text-sm text-purple-200/90 leading-relaxed">
          Where should we send your protocol? Enter your best email below for immediate PDF access.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
        <div>
          <label htmlFor="first-name-input" className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            First Name <span className="text-purple-400 font-normal">(Optional)</span>
          </label>
          <input
            id="first-name-input"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="e.g. Maria"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full min-h-[48px] px-4 py-3 bg-slate-950/70 border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        <div>
          <label htmlFor="email-input" className="block text-xs font-bold text-purple-200 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-pink-400">*</span>
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
            className="w-full min-h-[48px] px-4 py-3 bg-slate-950/70 border border-purple-500/40 rounded-xl text-sm text-white placeholder-purple-300/40 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>

        {errorMessage && (
          <div role="alert" className="p-3 bg-rose-950/80 border border-rose-600 rounded-xl text-xs text-rose-200 font-semibold text-center animate-fadeIn">
            ⚠️ {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full min-h-[52px] bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base py-3.5 px-6 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Sending Your Cheat Sheet...</span>
          ) : (
            <>
              <span>Send Me The Free 3-Page Cheat Sheet</span>
              <span className="text-xl">➔</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] sm:text-xs text-purple-300/80 flex items-center justify-center gap-1.5 pt-2">
          <span>🔒</span>
          <span>100% Privacy Guaranteed under RA 10173. Safe, encrypted, and never shared.</span>
        </p>
      </form>
    </div>
  );
}
