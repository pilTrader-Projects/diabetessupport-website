/**
 * Interface definition for Diabetes Awareness & Educational Pillars.
 * @usecase Strongly types awareness campaign cards and educational sections.
 */
export interface AwarenessPillar {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  stat: string;
}

/**
 * Site-wide configuration constants.
 *
 * @usecase Supplies meta titles, descriptions, WordPress source API, and social links to Next.js layout and head metadata.
 * @dependencies None. Centralized single source of truth for site configuration.
 */
export const SITE_CONFIG = {
  title: 'DiabetesCare PH - Educational & Awareness Campaign for Diabetes Care',
  description:
    'Protect your family and income from diabetes. Learn the vital numbers, manual tracking advantage, and reverse insulin resistance naturally.',
  domain: 'diabetescareph.com',
  wordpressApiUrl:
    process.env.WORDPRESS_API_URL ||
    'https://public-api.wordpress.com/wp/v2/sites/diabetescareph.wordpress.com',
  author: 'DiabetesCare PH',
  social: {
    facebook: 'https://facebook.com/diabetescareph',
    twitter: 'https://twitter.com/diabetescareph',
  },
};

/**
 * Educational awareness pillars exposing the sneaky nature of diabetes and framing manual tracking as wealth protection.
 *
 * @usecase Drives the educational awareness grid and value proposition.
 * @dependencies AwarenessPillar interface.
 */
export const AWARENESS_PILLARS: AwarenessPillar[] = [
  {
    id: 'silent-killer',
    title: 'The Silent Killer Threat',
    subtitle: 'Over 4 Million Cases in PH',
    description:
      'Over 4 million Filipinos are currently living with diabetes, and nearly half don’t even know it. Because it causes zero physical pain in the early stages, routine checking is your only early warning system.',
    icon: '🥷',
    stat: '46% Undiagnosed in PH',
  },
  {
    id: 'status-quo-trap',
    title: 'Wealth Protection Tool',
    subtitle: 'Prevent Family Catastrophe',
    description:
      'A box of finger-prick test strips is vastly cheaper than a continuous monitor, and infinitely cheaper than a dialysis session or stroke recovery bill.',
    icon: '🛡️',
    stat: 'Protect Your Income',
  },
  {
    id: 'early-detection',
    title: 'The Reversibility Critical Window',
    subtitle: 'Catch It Before Permanent Harm',
    description:
      'Catching elevated HbA1c between 5.7% and 6.4% gives you the critical window to reverse insulin resistance and restore metabolic balance through lifestyle changes before requiring insulin injections.',
    icon: '🔬',
    stat: 'Reversible in Early Stages',
  },
];

/**
 * Google AdSense publisher and activation settings.
 *
 * @usecase Controls ad unit rendering and fallback UI behavior across layout routes.
 * @dependencies process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID, process.env.NEXT_PUBLIC_ENABLE_ADS.
 */
export const ADSENSE_CONFIG = {
  publisherId: process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || 'ca-pub-0000000000000000',
  enabled: process.env.NEXT_PUBLIC_ENABLE_ADS !== 'false',
};

/**
 * Kit (ConvertKit) marketing integration configuration.
 *
 * @usecase Configures lead capture forms and newsletter subscription embeds.
 * @dependencies process.env.NEXT_PUBLIC_KIT_FORM_ID, process.env.NEXT_PUBLIC_KIT_SCRIPT_URL.
 */
export const KIT_MARKETING_CONFIG = {
  formId: process.env.NEXT_PUBLIC_KIT_FORM_ID || '',
  scriptUrl: process.env.NEXT_PUBLIC_KIT_SCRIPT_URL || '',
};
