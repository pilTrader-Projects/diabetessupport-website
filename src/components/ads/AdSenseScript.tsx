'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import { ADSENSE_CONFIG } from '@/config/constants';
import { getStoredConsent, CONSENT_CHANGED_EVENT, ConsentPreferences } from '@/lib/consent';

/**
 * Client-side hook-driven loader that activates AdSense only when marketing consent is granted.
 */
function AdSenseClient({ publisherId }: { publisherId: string }) {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    // 1. Check existing stored consent
    const existing = getStoredConsent();
    if (existing?.marketing) {
      setHasConsent(true);
    }

    // 2. React to dynamic consent updates
    const handleConsentChanged = (e: Event) => {
      const detail = (e as CustomEvent<ConsentPreferences>).detail;
      if (detail) {
        setHasConsent(Boolean(detail.marketing));
      }
    };

    window.addEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
    return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handleConsentChanged);
  }, []);

  if (!hasConsent) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      crossOrigin="anonymous"
    />
  );
}

/**
 * Global Asynchronous Google AdSense Script Loader Component.
 *
 * @usecase Injects the official Google AdSense script after interactive page hydration,
 * strictly after affirmative user consent is granted for advertising/marketing trackers.
 * @dependencies Next.js Script component, ADSENSE_CONFIG constant, consent module.
 * @returns {JSX.Element | null} Rendered Script tag or null if unconsented or disabled.
 */
export default function AdSenseScript() {
  if (
    !ADSENSE_CONFIG.enabled ||
    !ADSENSE_CONFIG.publisherId ||
    ADSENSE_CONFIG.publisherId === 'ca-pub-0000000000000000'
  ) {
    return null;
  }

  return <AdSenseClient publisherId={ADSENSE_CONFIG.publisherId} />;
}
