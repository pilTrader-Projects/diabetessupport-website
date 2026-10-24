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
  mode?: 'active' | 'waitlist' | 'closed';
  title?: string;
  subtitle?: React.ReactNode;
  buttonText?: string;
  placeholder?: string;
  className?: string;
  symptomsChecked?: string[];
  noticeVersion?: string;
  onSuccess?: (data: { email: string; downloadUrl?: string }) => void;
}

export const DEFAULT_WAITLIST_STATUS_SUFFIX = ' [Paused - Join Waitlist]';
export const DEFAULT_WAITLIST_BUTTON_LABEL = 'Join the Waiting List';
export const DEFAULT_WAITLIST_NOTICE_TEXT =
  'This guide is currently paused and undergoing updates. Enter your details below to join the waiting list and be notified the moment it reopens.';
export const DEFAULT_WAITLIST_BADGE_LABEL = 'Campaign Paused — Join Waiting List';

/**
 * Strips any trailing directional arrows or entity codes from button text to prevent duplicate arrow rendering.
 */
export function sanitizeTrailingArrows(rawText: string): string {
  return rawText.replace(/(?:[\s\u00A0]*(?:→|&rarr;|->))+$/g, '').trim();
}

/**
 * Accessible waitlist status indicator badge.
 */
export function WaitlistBadge(): React.JSX.Element {
  return (
    <div
      data-testid="email-capture-waitlist-badge"
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
    >
      <span>⏸️</span>
      <span>{DEFAULT_WAITLIST_BADGE_LABEL}</span>
    </div>
  );
}

/**
 * Informative callout banner explaining the waitlist / paused status.
 */
export function WaitlistNoticeBox(): React.JSX.Element {
  return (
    <div
      data-testid="email-capture-waitlist-notice"
      className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200/90 text-xs sm:text-xs leading-relaxed flex items-start gap-2"
    >
      <span className="shrink-0 text-sm">ℹ️</span>
      <span>
        <strong>Notice:</strong> {DEFAULT_WAITLIST_NOTICE_TEXT}
      </span>
    </div>
  );
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
  mode = 'active',
  title = 'Get Our Free Diabetes Care & Insulin Sensitivity Guide',
  subtitle = 'Join Filipino family providers receiving evidence-based lifestyle tips, low-GI ancestral meal plans, and blood sugar tracking advice.',
  buttonText,
  placeholder = 'Enter your email address...',
  className = '',
  symptomsChecked = [],
  noticeVersion = '2026.1',
  onSuccess,
}: EmailCaptureProps): React.JSX.Element {
  const isWaitlist = mode === 'waitlist';

  // 1. Title handling: Append status if waitlist and not already specified
  const hasWaitlistInTitle =
    title && /(?:waitlist|waiting\s*list|paused|inactive)/i.test(title);
  const effectiveTitle = isWaitlist
    ? hasWaitlistInTitle
      ? title
      : `${title}${DEFAULT_WAITLIST_STATUS_SUFFIX}`
    : title;

  // 2. Action button handling: Convey joining waitlist in waitlist mode
  let rawButtonText: string = 'Claim Free Guide';
  if (isWaitlist) {
    const hasWaitlistInButton =
      buttonText && /(?:waitlist|waiting\s*list)/i.test(buttonText);
    rawButtonText = hasWaitlistInButton ? buttonText : DEFAULT_WAITLIST_BUTTON_LABEL;
  } else if (buttonText) {
    rawButtonText = buttonText;
  }

  // 3. Arrow sanitization: Strip trailing arrows to prevent double-arrow glitch
  const effectiveButtonText = sanitizeTrailingArrows(rawButtonText);

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
    isWaitlist?: boolean;
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
        message:
          data.message ||
          (data.isWaitlist
            ? "You've been added to the priority waitlist! We will notify you as soon as this guide is updated."
            : 'Thank you! Please check your inbox for confirmation.'),
        downloadUrl: data.downloadUrl,
        appUrl: data.appUrl,
        appName: data.appName,
        ctaText: data.ctaText,
        isWaitlist: Boolean(data.isWaitlist),
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

  // Render Closed State
  if (mode === 'closed') {
    return (
      <div
        data-testid="email-capture-closed"
        className={`p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center space-y-3 shadow-xl backdrop-blur-md ${className}`}
      >
        <div className="w-10 h-10 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto text-xl border border-slate-700">
          🔒
        </div>
        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-white">Registrations Currently Closed</h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            This guide or registration is currently closed to new entries. Please check back later or explore our public learning resources.
          </p>
        </div>
      </div>
    );
  }

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
          <h3 className="text-xl font-black text-white">
            {successData.isWaitlist ? "Priority Waitlist Confirmed! 🎉" : "Check Your Inbox!"}
          </h3>
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
              <span>{effectiveButtonText}</span>
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
          {isWaitlist && <WaitlistBadge />}
          {effectiveTitle && (
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {effectiveTitle}
            </h3>
          )}
          {subtitle && (
            <div className="text-xs sm:text-sm text-teal-100/80 leading-relaxed whitespace-pre-line">
              {subtitle}
            </div>
          )}
          {isWaitlist && <WaitlistNoticeBox />}
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
            <span>{effectiveButtonText} &rarr;</span>
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
        {isWaitlist && <WaitlistBadge />}
        {effectiveTitle && (
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {effectiveTitle}
          </h3>
        )}
        {subtitle && (
          <div className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {subtitle}
          </div>
        )}
        {isWaitlist && <WaitlistNoticeBox />}
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
        className={`w-full py-4 px-6 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer ${
          isWaitlist
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
            : 'bg-teal-600 hover:bg-teal-500 text-white'
        }`}
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <span>{effectiveButtonText} &rarr;</span>
        )}
      </button>

      <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
        <span>🔒</span>
        <span>Double opt-in confirmation • Zero spam promise • Unsubscribe anytime.</span>
      </p>
    </form>
  );
}
