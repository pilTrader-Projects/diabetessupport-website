'use client';

import React, { useState } from 'react';
import { CAMPAIGN_CODES } from '@/config/leadConfig';

export interface LeadMagnetCardProps {
  title?: string;
  subtitle?: string;
  source?: string;
}

/**
 * Lead Magnet Promotional Card Component.
 *
 * @usecase Captures companion app leads natively on-page and enrolls them into Brevo companion_app_users list.
 * @param {LeadMagnetCardProps} props Custom parameters (title, subtitle, source).
 * @dependencies /api/v1/subscribe REST API endpoint, Tailwind CSS.
 * @returns {JSX.Element} Rendered promotional card container with native lead capture.
 */
export default function LeadMagnetCard({
  title = "Secure Your Health. Protect Your Family's Future.",
  subtitle = 'Turn everyday manual finger-prick logs and blood pressure checks into clear, organized health trends to share with your physician.',
  source = CAMPAIGN_CODES.COMPANION_APP_USERS,
}: LeadMagnetCardProps): React.JSX.Element {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [appName, setAppName] = useState('GlycoSense');
  const [appUrl, setAppUrl] = useState('https://glycosense.vercel.app');
  const [ctaText, setCtaText] = useState('Launch GlycoSense App Now');
  const [openInNewTab, setOpenInNewTab] = useState(true);
  const [successData, setSuccessData] = useState<{
    successTitle: string;
    successMsg: string;
    appUrl: string;
    appName: string;
    ctaText: string;
    openInNewTab: boolean;
  } | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/v1/app-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (isMounted && payload?.success && payload?.data) {
          if (payload.data.appName) setAppName(payload.data.appName);
          if (payload.data.appUrl) setAppUrl(payload.data.appUrl);
          if (payload.data.ctaText) setCtaText(payload.data.ctaText);
          if (payload.data.openInNewTab !== undefined) setOpenInNewTab(Boolean(payload.data.openInNewTab));
        }
      })
      .catch(() => {
        // Fallback gracefully to default constants if fetch fails
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessData(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim() || undefined,
          email: cleanEmail,
          source: source || CAMPAIGN_CODES.COMPANION_APP_USERS,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Failed to claim account access. Please try again.');
      } else {
        const resolvedUrl = data.appUrl || appUrl || 'https://glycosense.vercel.app';
        const resolvedName = data.appName || appName || 'GlycoSense';
        const resolvedCta = data.ctaText || ctaText || `Launch ${resolvedName} App Now`;
        const resolvedTitle = data.successTitle || 'Free Account Access Ready!';
        const resolvedMsg =
          data.message ||
          'Your free account access is ready! Click below to launch your companion app immediately.';
        const resolvedTab = data.openInNewTab !== undefined ? Boolean(data.openInNewTab) : openInNewTab;

        setSuccessData({
          successTitle: resolvedTitle,
          successMsg: resolvedMsg,
          appUrl: resolvedUrl,
          appName: resolvedName,
          ctaText: resolvedCta,
          openInNewTab: resolvedTab,
        });

        setEmail('');
        setFirstName('');
      }
    } catch {
      setErrorMsg('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="my-2 sm:my-3 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel grid grid-cols-1 lg:grid-cols-12 text-left">
      {/* Left Feature Bullet Area */}
      <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="space-y-4">
          <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
            🛡️ ZERO-COST WEALTH PROTECTION
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
            {title}
          </h3>
          <p className="text-sm text-purple-100/90 leading-relaxed">
            {subtitle}
          </p>

          <ul className="space-y-3.5 pt-2 text-sm text-purple-50">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Smart Meal &amp; Glucose Logger</strong>: Log what you ate alongside your 2-hour finger prick. Our AI instantly charts your personal food triggers so you know exactly which local dishes cause your blood sugar to spike.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Prescription Ledger &amp; Timeline</strong>: Maintain a permanent, organized record of your active and discontinued medications. Give your healthcare provider a completely accurate chronological history to prevent drug interaction oversights and streamline tracking.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Doctor-Ready PDF Summaries</strong>: Instantly export structured statistical briefs of your blood pressure curves and glucose logs to hand straight to your doctor at your next checkup.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/15 text-xs text-purple-200/90 space-y-1">
          <div className="flex items-center gap-2 font-bold text-white">
            <span>★★★★★</span>
            <span>Join the growing movement of Filipino family providers</span>
          </div>
          <p className="text-[11px] text-purple-200/80 leading-relaxed">
            Be part of the early wave of breadwinners taking back control of their metabolic health before complications start.
          </p>
        </div>
      </div>

      {/* Right Form / CTA Panel */}
      <div className="lg:col-span-6 p-6 sm:p-8 flex items-center">
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="space-y-2">
            <span className="inline-block bg-amber-400/25 text-amber-200 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-300/40 backdrop-blur-sm">
              🎁 FREE ACCESS FOR PROVIDERS
            </span>
            <h4 className="text-2xl font-extrabold text-white">Get Instant Access to Your Free Account</h4>
            <p className="text-xs text-purple-100 max-w-md mx-auto leading-relaxed">
              Enter your details below to get FREE ACCESS to the {appName} App and secure your health for the people who count on you.
            </p>
          </div>

          {successData ? (
            <div className="p-6 bg-white/20 backdrop-blur-md rounded-2xl text-center space-y-4 border border-white/30 animate-fadeIn">
              <span className="text-4xl block animate-bounce">🎉</span>
              <div className="space-y-1">
                <h5 className="text-xl font-black text-white">{successData.successTitle}</h5>
                <p className="text-xs sm:text-sm text-purple-100 leading-relaxed">{successData.successMsg}</p>
              </div>

              {/* Immediate App Link CTA - No waiting for email */}
              <div className="pt-2">
                <a
                  id="lead-magnet-app-cta"
                  href={successData.appUrl}
                  target={successData.openInNewTab ? '_blank' : '_self'}
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-base sm:text-lg rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-amber-200 cursor-pointer"
                >
                  <span>{successData.ctaText}</span>
                  <span className="text-lg">➔</span>
                </a>
              </div>

              <p className="text-[11px] text-purple-200/90 leading-tight">
                ⚡ Instant access active — click above to open your account now. A confirmation has also been recorded for your email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-left">
              <div>
                <label htmlFor="lead-magnet-first-name" className="block text-[11px] font-bold text-purple-100 uppercase tracking-wider mb-1">
                  First Name <span className="text-purple-200/70 font-normal">(Optional)</span>
                </label>
                <input
                  id="lead-magnet-first-name"
                  type="text"
                  name="firstName"
                  autoComplete="name"
                  placeholder="e.g. Maria"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm border border-white/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label htmlFor="lead-magnet-email" className="block text-[11px] font-bold text-purple-100 uppercase tracking-wider mb-1">
                  Email Address <span className="text-amber-300">*</span>
                </label>
                <input
                  id="lead-magnet-email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl text-sm border border-white/30 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              {errorMsg && (
                <div role="alert" className="p-2.5 bg-rose-950/80 border border-rose-400/60 rounded-xl text-xs text-rose-200 font-semibold text-center">
                  ⚠️ {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-blue-900 font-black text-sm sm:text-base rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white disabled:opacity-60"
              >
                {loading ? (
                  <span>Claiming Free Access...</span>
                ) : (
                  <>
                    <span>Claim Your Free {appName} Account</span>
                    <span className="text-lg">➔</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-[11px] text-purple-200/90 flex items-center justify-center gap-1.5 text-center">
            <span>🔒</span>
            <span>100% Privacy Guaranteed under RA 10173. Safe, encrypted, and never shared.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
