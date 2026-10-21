'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { GA_CONFIG } from '@/config/constants';
import { getStoredConsent, CONSENT_CHANGED_EVENT, ConsentPreferences } from '@/lib/consent';

interface GoogleAnalyticsProps {
  gaId?: string;
}

/**
 * Client-side hook-driven loader that activates GA4 only when analytics consent is granted.
 */
function GoogleAnalyticsClient({ measurementId }: { measurementId: string }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // 1. Check existing stored consent
    const existing = getStoredConsent();
    if (existing?.analytics) {
      setHasConsent(true);
    }

    // 2. React to dynamic consent updates
    const handleConsentChanged = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      if (detail) {
        setHasConsent(Boolean(detail.analytics));
      }
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
  }, []);

  if (!hasConsent) {
    return null;
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <Script
        id="google-analytics-gtag"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}

/**
 * Global Asynchronous Google Analytics (gtag.js) Script Loader Component.
 *
 * @usecase Injects the official Google Analytics measurement scripts into the application layout
 * strictly after affirmative user consent is granted under Google Consent Mode v2 and RA 10173.
 * @dependencies Next.js Script component, GA_CONFIG constant, consent module.
 * @returns {JSX.Element | null} Rendered Script components or null if unconsented or disabled.
 */
export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps = {}) {
  const measurementId = gaId !== undefined ? gaId : GA_CONFIG.measurementId;

  if (!measurementId) {
    return null;
  }

  return <GoogleAnalyticsClient measurementId={measurementId} />;
}
