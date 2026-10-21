'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  dispatchEmailSignup,
  dispatchLeadMagnetDownload,
} from '@/analytics';

export interface EmailCaptureProps {
  source: string;
  edition?: string;
  layout?: 'card' | 'inline' | 'hero' | 'funnel';
  title?: string;
  subtitle?: string;
  buttonText?: string;
  placeholder?: string;
  className?: string;
  symptomsChecked?: string[];
  noticeVersion?: string;
  onSuccess?: (data: { email: string; downloadUrl?: string }) => void;
}

/**
 * Unified, Accessible <EmailCapture /> Component (P1-04).
 *
 * @usecase Single source of truth for capturing subscriber emails and lead magnet claims across the platform.
 * Enforces affirmative consent checkboxes (RA 10173), honeypot bot trap, loading and error states, and dispatches email_signup events.
 *
 * @param {EmailCaptureProps} props Configuration and layout parameters.
 * @returns {React.JSX.Element} Rendered email capture form.
 */
export default function EmailCapture({
  source,
  edition = 'ph',
  layout = 'card',
  title = 'Get Our Free Diabetes Care & Insulin Sensitivity Guide',
  subtitle = 'Join Filipino family providers receiving evidence-based lifestyle tips, low-GI ancestral meal plans, and blood sugar tracking advice.',
  buttonText = 'Claim Free Guide',
  placeholder = 'Enter your email address...',
  className = '',
  symptomsChecked = [],
  noticeVersion = '2026.1',
  onSuccess,
}: EmailCaptureProps): React.JSX.Element {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    message: string;
    downloadUrl?: string;
    appUrl?: string;
    appName?: string;
    ctaText?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!consent) {
      setErrorMessage('Please agree to the privacy notice to continue.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          firstName: firstName.trim() || undefined,
          source,
          edition,
          consent: true,
          noticeVersion,
          honeypot: honeypot.trim() || undefined,
          symptomsChecked,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to submit. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessData({
        message: data.message || 'Thank you! Please check your inbox for confirmation.',
        downloadUrl: data.downloadUrl,
        appUrl: data.appUrl,
        appName: data.appName,
        ctaText: data.ctaText,
      });

      // Dispatch GA4 conversion event and custom browser event (P1-05)
      dispatchEmailSignup({ source, edition });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('bts:email_signup', {
            detail: { source, edition },
          })
        );
      }

      if (onSuccess) {
        onSuccess({ email: cleanEmail, downloadUrl: data.downloadUrl });
      }
    } catch (err: any) {
      setErrorMessage('Network connection error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Success State
  if (successData) {
    return (
      <div
        data-testid="email-capture-success"
        className={`p-6 sm:p-8 rounded-3xl bg-teal-950/80 border border-teal-500/40 text-center space-y-4 shadow-xl backdrop-blur-md ${className}`}
      >
        <div className="w-12 h-12 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-teal-500/30">
          ✓
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-white">Check Your Inbox!</h3>
          <p className="text-sm text-teal-100/90 max-w-md mx-auto leading-relaxed">
            {successData.message}
          </p>
        </div>

        {/* Dynamic Download Action if tokenized download URL was issued */}
        {successData.downloadUrl && (
          <div className="pt-2">
            <a
              href={successData.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                dispatchLeadMagnetDownload({
                  file_name: 'lead_magnet_guide',
                  source,
                  edition,
                });
              }}
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>📥 Download Your Guide Now</span>
              <span>&rarr;</span>
            </a>
          </div>
        )}

        {/* Companion App Launch Action if returned */}
        {successData.appUrl && (
          <div className="pt-2">
            <a
              href={successData.appUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{successData.ctaText || `Launch ${successData.appName || 'Account'}`}</span>
              <span>&rarr;</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  // Visual Layout: Inline Form
  if (layout === 'inline') {
    return (
      <form
        onSubmit={handleSubmit}
        data-testid="email-capture-form"
        className={`space-y-3 ${className}`}
      >
        {/* Hidden Honeypot Field */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input
            type="text"
            name="hp_field"
            data-testid="email-capture-honeypot"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <input
            type="email"
            name="email"
            data-testid="email-capture-input"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent placeholder:text-slate-400 shadow-sm"
          />
          <button
            type="submit"
            data-testid="email-capture-submit-btn"
            disabled={loading}
            className="py-3 px-6 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{buttonText}</span>
            )}
          </button>
        </div>

        {/* Affirmative Consent Checkbox (RA 10173) */}
        <label className="flex items-start gap-2 cursor-pointer text-left">
          <input
            type="checkbox"
            data-testid="email-capture-consent-checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4 cursor-pointer"
          />
          <span className="text-[11px] text-slate-600 leading-snug">
            I agree to receive educational health emails and accept the{' '}
            <Link href="/privacy" className="text-teal-700 underline hover:text-teal-900" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {errorMessage && (
          <p
            data-testid="email-capture-error"
            className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-left"
          >
            {errorMessage}
          </p>
        )}
      </form>
    );
  }

  // Visual Layout: Funnel (Dark-Mode Signature)
  if (layout === 'funnel') {
    return (
      <form
        onSubmit={handleSubmit}
        data-testid="email-capture-form"
        className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-teal-950/80 to-slate-950 border border-teal-500/40 text-left space-y-5 shadow-2xl backdrop-blur-md ${className}`}
      >
        {/* Hidden Honeypot Field */}
        <div style={{ display: 'none' }} aria-hidden="true">
          <input
            type="text"
            name="hp_field"
            data-testid="email-capture-honeypot"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          {title && (
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-teal-100/80 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              First Name <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              name="firstName"
              data-testid="firstname-capture-input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Maria"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-300 block">
              Email Address <span className="text-teal-400 font-bold">*</span>
            </label>
            <input
              type="email"
              name="email"
              data-testid="email-capture-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@gmail.com"
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Affirmative Consent Checkbox (RA 10173) */}
        <label className="flex items-start gap-2.5 cursor-pointer text-left pt-1">
          <input
            type="checkbox"
            data-testid="email-capture-consent-checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-400 h-4 w-4 cursor-pointer"
          />
          <span className="text-xs text-slate-300 leading-snug">
            I consent to receive educational health emails and confirm I have reviewed the{' '}
            <Link href="/privacy" className="text-teal-400 underline hover:text-teal-300" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>

        {errorMessage && (
          <p
            data-testid="email-capture-error"
            className="text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl"
          >
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          data-testid="email-capture-submit-btn"
          disabled={loading}
          className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>{buttonText} &rarr;</span>
          )}
        </button>

        <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>100% Private under RA 10173. Double opt-in confirmation required.</span>
        </p>
      </form>
    );
  }

  // Visual Layout: Card / Hero (Default)
  return (
    <form
      onSubmit={handleSubmit}
      data-testid="email-capture-form"
      className={`p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 text-left space-y-5 shadow-xl text-white ${className}`}
    >
      {/* Hidden Honeypot Field */}
      <div style={{ display: 'none' }} aria-hidden="true">
        <input
          type="text"
          name="hp_field"
          data-testid="email-capture-honeypot"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        {title && (
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            First Name <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            name="firstName"
            data-testid="firstname-capture-input"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Juan"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-300 block">
            Email Address <span className="text-teal-400 font-bold">*</span>
          </label>
          <input
            type="email"
            name="email"
            data-testid="email-capture-input"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="juan@example.com"
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Affirmative Consent Checkbox (RA 10173) */}
      <label className="flex items-start gap-2.5 cursor-pointer text-left pt-1">
        <input
          type="checkbox"
          data-testid="email-capture-consent-checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-400 h-4 w-4 cursor-pointer"
        />
        <span className="text-xs text-slate-300 leading-snug">
          I consent to receive educational health emails and confirm I have reviewed the{' '}
          <Link href="/privacy" className="text-teal-400 underline hover:text-teal-300" target="_blank">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      {errorMessage && (
        <p
          data-testid="email-capture-error"
          className="text-xs font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/40 p-3 rounded-xl"
        >
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        data-testid="email-capture-submit-btn"
        disabled={loading}
        className="w-full py-4 px-6 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>{buttonText} &rarr;</span>
        )}
      </button>

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
        <span>🔒</span>
        <span>Double opt-in confirmation • Zero spam promise • Unsubscribe anytime.</span>
      </p>
    </form>
  );
}
