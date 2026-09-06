'use client';

import Script from 'next/script';
import { ADSENSE_CONFIG } from '@/config/constants';

/**
 * Global Asynchronous Google AdSense Script Loader Component.
 *
 * @usecase Injects the official Google AdSense script after interactive page hydration.
 * @dependencies Next.js Script component, ADSENSE_CONFIG constant.
 * @returns {JSX.Element | null} Rendered Script tag or null if disabled.
 */
export default function AdSenseScript() {
  if (
    !ADSENSE_CONFIG.enabled ||
    !ADSENSE_CONFIG.publisherId ||
    ADSENSE_CONFIG.publisherId === 'ca-pub-0000000000000000'
  ) {
    return null;
  }

  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.publisherId}`}
      crossOrigin="anonymous"
    />
  );
}
