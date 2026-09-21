import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';
import { buildInsulinResetSchema } from '@/lib/schema';
import InsulinResetClient from '@/components/funnel/InsulinResetClient';

export const metadata: Metadata = {
  title: `Your "Normal" Blood Sugar Test is a Lie | Insulin Reset Protocol Cheat Sheet`,
  description:
    'Your body can hide metabolic breakdown for 10 to 15 years behind normal glucose readings. Discover Dr. Bikman\'s metabolic research and download the free 3-page Insulin Reset cheat sheet.',
  keywords: [
    'insulin resistance',
    'hyperinsulinemia',
    'Benjamin Bikman',
    'normal blood sugar lie',
    'insulin reset protocol',
    'prediabetes symptoms',
    'metabolic health',
    'fasting insulin test',
  ],
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}/insulin-reset`,
  },
  openGraph: {
    title: 'Your "Normal" Blood Sugar Test is a Lie | Free 3-Page Cheat Sheet',
    description:
      'Discover the single invisible hormone silently driving fatigue and weight gain 10-15 years before standard blood sugar tests detect it.',
    url: `https://${SITE_CONFIG.domain}/insulin-reset`,
    siteName: SITE_CONFIG.title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Your "Normal" Blood Sugar Test is a Lie',
    description:
      'Learn why tracking glucose alone misses chronic hyperinsulinemia and get the 4 Golden Rules to reset insulin sensitivity.',
  },
};

/**
 * Low-Awareness Lead Capture Landing Page (/insulin-reset).
 *
 * @usecase Captures low-awareness users who believe they are healthy because of "normal blood sugar tests" but exhibit chronic hyperinsulinemia symptoms. Matches global site layout.
 * @dependencies InsulinResetClient, buildInsulinResetSchema, SITE_CONFIG.
 * @returns {JSX.Element} Rendered landing page.
 */
export default function InsulinResetPage(): React.JSX.Element {
  const jsonLd = buildInsulinResetSchema();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* JSON-LD Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main>
        <InsulinResetClient />
      </main>
    </div>
  );
}
