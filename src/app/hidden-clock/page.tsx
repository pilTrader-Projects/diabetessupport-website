import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';
import InsulinResetPage from '@/app/insulin-reset/page';

export const metadata: Metadata = {
  title: `The Hidden Metabolic Clock: Why "Normal" Blood Sugar Isn't the Whole Story | DiabetesCare PH`,
  description:
    'Your body can hide metabolic breakdown for years behind normal glucose readings. Download the free 8-page guide: The Hidden Metabolic Clock.',
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
