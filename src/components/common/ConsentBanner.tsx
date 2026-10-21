'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getStoredConsent,
  setStoredConsent,
  OPEN_CONSENT_MODAL_EVENT,
  CONSENT_CHANGED_EVENT,
  ConsentPreferences,
} from '@/lib/consent';

/**
 * Accessible, WCAG-compliant Cookie Consent Banner and Granular Preferences Modal.
 *
 * @usecase Implements Google Consent Mode v2 and Republic Act No. 10173 (DPA 2012)
 * affirmative consent standards for analytics and advertising trackers.
 */
export default function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Granular preference state for the customize modal
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // Synchronize state with stored consent upon hydration
  useEffect(() => {
    setMounted(true);
    const existing = getStoredConsent();
    if (!existing) {
      setShowBanner(true);
      setAnalyticsConsent(false);
      setMarketingConsent(false);
    } else {
      setShowBanner(false);
      setAnalyticsConsent(existing.analytics);
      setMarketingConsent(existing.marketing);
    }

    // Listen for external trigger from footer or other links
    const handleOpenModal = () => {
      const current = getStoredConsent();
      if (current) {
        setAnalyticsConsent(current.analytics);
        setMarketingConsent(current.marketing);
      }
      setShowModal(true);
    };

    // Listen for consent changes across windows or scripts
    const handleConsentChanged = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      if (detail) {
        setAnalyticsConsent(detail.analytics);
        setMarketingConsent(detail.marketing);
        setShowBanner(false);
      }
    };

    window.addEventListener(OPEN_CONSENT_MODAL_EVENT, handleOpenModal);
    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);

    return () => {
      window.removeEventListener(OPEN_CONSENT_MODAL_EVENT, handleOpenModal);
      window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
    };
  }, []);

  // Handle escape key to dismiss the customize modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModal) {
        setShowModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  const handleAcceptAll = useCallback(() => {
    setStoredConsent({ analytics: true, marketing: true });
    setAnalyticsConsent(true);
    setMarketingConsent(true);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleRejectAll = useCallback(() => {
    setStoredConsent({ analytics: false, marketing: false });
    setAnalyticsConsent(false);
    setMarketingConsent(false);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    setStoredConsent({
      analytics: analyticsConsent,
      marketing: marketingConsent,
    });
    setShowBanner(false);
    setShowModal(false);
  }, [analyticsConsent, marketingConsent]);

  // Prevent SSR hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* 1. Sticky Bottom Consent Banner */}
      {showBanner && !showModal && (
        <section
          role="region"
          aria-label="Cookie consent banner"
          id="cookie-consent-banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-slate-900/95 backdrop-blur-md text-white border-t border-slate-700 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-3xl">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span aria-hidden="true">🛡️</span> Privacy & Cookie Preferences
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                We use cookies and pseudonymous identifiers to ensure website security, measure anonymous engagement via Google Analytics, and display relevant educational sponsors under Republic Act No. 10173 (Data Privacy Act of 2012). No personal health data is shared with advertisers. Learn more in our{' '}
                <Link
                  href="/privacy"
                  className="text-blue-400 hover:text-blue-300 underline font-medium underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                id="consent-reject-all-btn"
                onClick={handleRejectAll}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-600 hover:bg-slate-800 text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                id="consent-customize-btn"
                onClick={() => setShowModal(true)}
                className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-purple-500/50 hover:bg-purple-900/40 text-purple-200 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                Cookie Settings
              </button>
              <button
                type="button"
                id="consent-accept-all-btn"
                onClick={handleAcceptAll}
                className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                Accept All
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. Granular Cookie Preferences Modal */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-modal-title"
          id="cookie-preferences-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
        >
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-white space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 id="consent-modal-title" className="text-xl font-bold tracking-tight text-white">
                Cookie & Privacy Settings
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close cookie settings dialog"
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Customize which cookies and data collection tags you permit Before the Numbers to utilize. Strict Essential cookies are necessary for core security and offline functionality.
            </p>

            <div className="space-y-4">
              {/* Essential Category */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-white">
                      Strictly Essential Cookies
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Required for core site security, device pairing, and offline tracker persistence. Cannot be disabled.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled={true}
                    aria-label="Strictly Essential Cookies always active"
                    className="w-5 h-5 rounded text-blue-600 bg-slate-700 border-slate-600 cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              {/* Analytics Category */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="space-y-1">
                  <span className="font-semibold text-sm sm:text-base text-white">
                    Analytics & Performance (GA4)
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Permits Google Analytics 4 to collect aggregate, pseudonymous traffic numbers, video interactions, and page visit metrics. Does not collect health metrics or email addresses.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="consent-toggle-analytics"
                      checked={analyticsConsent}
                      onChange={(e) => setAnalyticsConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* Advertising Category */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="space-y-1">
                  <span className="font-semibold text-sm sm:text-base text-white">
                    Display Advertising & Sponsorship (Google AdSense)
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Permits Google AdSense and sponsor partner tags to deliver contextual ads that fund our free educational tools and community operations.
                  </p>
                </div>
                <div className="shrink-0 pt-1">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      id="consent-toggle-marketing"
                      checked={marketingConsent}
                      onChange={(e) => setMarketingConsent(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Reject All Non-Essential
              </button>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="consent-save-preferences-btn"
                  onClick={handleSavePreferences}
                  className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
                >
                  Save Choices
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition-colors"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
