import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';
import InsulinResetPage from '@/app/insulin-reset/page';

export const metadata: Metadata = {
  title: `The Hidden Clock: Your "Normal" Blood Sugar Test is a Lie | DiabetesCare PH`,
  description:
    'Your body can hide metabolic breakdown for 10 to 15 years behind normal glucose readings. Download the free 3-page Hidden Clock Insulin Reset cheat sheet.',
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
