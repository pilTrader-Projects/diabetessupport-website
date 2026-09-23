import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';
import { buildInsulinResetSchema } from '@/lib/schema';
import InsulinResetClient from '@/components/funnel/InsulinResetClient';

export const metadata: Metadata = {
  title: `Why "Normal" Blood Sugar Isn't the Whole Story | The Hidden Metabolic Clock`,
  description:
    'Your body can hide metabolic breakdown for years behind normal glucose readings. Discover insulin resistance research and download the free 8-page guide: The Hidden Metabolic Clock.',
  keywords: [
    'The Hidden Metabolic Clock',
    'insulin resistance',
    'hyperinsulinemia',
    'Benjamin Bikman',
    'normal blood sugar whole story',
    'insulin reset protocol',
    'prediabetes symptoms',
    'metabolic health',
    'fasting insulin test',
    'Filipino metabolic health',
  ],
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}/insulin-reset`,
  },
  openGraph: {
    title: 'Why "Normal" Blood Sugar Isn\'t the Whole Story | Free 8-Page Guide',
    description:
      'Discover the invisible metabolic compensation silently progressing years before standard blood sugar tests cross diagnostic thresholds.',
    url: `https://${SITE_CONFIG.domain}/insulin-reset`,
    siteName: SITE_CONFIG.title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Why "Normal" Blood Sugar Isn\'t the Whole Story',
    description:
      'Learn why tracking glucose alone misses chronic hyperinsulinemia and get the practical Filipino metabolic health action framework.',
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
