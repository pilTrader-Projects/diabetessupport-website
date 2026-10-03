'use client';

import Script from 'next/script';
import { GA_CONFIG } from '@/config/constants';

interface GoogleAnalyticsProps {
  gaId?: string;
}

/**
 * Global Asynchronous Google Analytics (gtag.js) Script Loader Component.
 *
 * @usecase Injects the official Google Analytics measurement scripts into the application layout.
 * @dependencies Next.js Script component, GA_CONFIG constant.
 * @returns {JSX.Element | null} Rendered Script components or null if measurement ID is empty.
 */
export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps = {}) {
  const measurementId = gaId !== undefined ? gaId : GA_CONFIG.measurementId;

  if (!measurementId) {
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
