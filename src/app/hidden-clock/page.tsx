import { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import InsulinResetPage from '@/app/insulin-reset/page';

export const metadata: Metadata = buildMetadata({
  title: 'The Hidden Metabolic Clock: What May Be Happening Before the Numbers Change',
  description:
    'Your body can compensate for metabolic breakdown for years behind normal glucose readings. Explore The Hidden Metabolic Clock framework and download the free guide.',
  path: '/hidden-clock',
  keywords: [
    'The Hidden Metabolic Clock',
    'insulin resistance',
    'hyperinsulinemia',
    'preventative health',
    'metabolic health education',
  ],
});

/**
 * Alternate Friendly Landing Page Route (/hidden-clock).
 *
 * @usecase Serves the Hidden Clock / Bikman Insulin Reset funnel on the /hidden-clock marketing slug.
 * @returns {JSX.Element} Rendered landing page.
 */
export default function HiddenClockPage(): React.JSX.Element {
  return <InsulinResetPage />;
}
