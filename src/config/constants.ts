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
    'Unmasking diabetes as the silent killer. Learn the warning signs, understand insulin resistance, and take proactive control before complications arise.',
  domain: 'diabetescareph.com',
  wordpressApiUrl:
    'https://public-api.wordpress.com/wp/v2/sites/diabetescareph.wordpress.com',
  author: 'DiabetesCare PH Awareness Team',
  social: {
    facebook: 'https://facebook.com/diabetescareph',
    twitter: 'https://twitter.com/diabetescareph',
  },
};

/**
 * Educational awareness pillars exposing the sneaky nature of diabetes and the risk of status-quo neglect.
 *
 * @usecase Drives the educational awareness grid on the homepage.
 * @dependencies AwarenessPillar interface.
 */
export const AWARENESS_PILLARS: AwarenessPillar[] = [
  {
    id: 'silent-killer',
    title: 'The Silent Killer Threat',
    subtitle: 'Thrives Without Symptoms',
    description:
      'High blood sugar quietly damages blood vessels and organs for years before symptoms become noticeable. Up to 1 in 2 adults living with diabetes remain undiagnosed.',
    icon: '🥷',
    stat: '46% Undiagnosed',
  },
  {
    id: 'status-quo-trap',
    title: 'The Danger of Status Quo',
    subtitle: 'Complacency Feeds Progression',
    description:
      'Relying on "feeling healthy" is dangerous. Normal feelings often mask progressive insulin resistance until vascular, kidney, or nerve damage has already begun.',
    icon: '⚠️',
    stat: '5-10 Years Hidden',
  },
  {
    id: 'early-detection',
    title: 'Early Detection Saves Lives',
    subtitle: 'HbA1c & Fasting Glucose',
    description:
      'Simple, routine blood tests reveal prediabetes early when it is completely reversible. Catching elevated glucose early prevents lifelong organ damage.',
    icon: '🔬',
    stat: '100% Reversible Early',
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
