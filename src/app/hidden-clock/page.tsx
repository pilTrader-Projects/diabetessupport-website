import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';
import InsulinResetPage from '@/app/insulin-reset/page';

export const metadata: Metadata = {
  title: `The Hidden Metabolic Clock: What May Be Happening Before the Numbers Change | Before the Numbers`,
  description:
    'Your body can compensate for metabolic breakdown for years behind normal glucose readings. Explore The Hidden Metabolic Clock framework and download the free guide.',
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}/insulin-reset`,
  },
};

/**
 * Alternate Friendly Landing Page Route (/hidden-clock).
 *
 * @usecase Serves the Hidden Clock / Bikman Insulin Reset funnel on the /hidden-clock marketing slug.
 * @returns {JSX.Element} Rendered landing page.
 */
export default function HiddenClockPage(): React.JSX.Element {
  return <InsulinResetPage />;
}
