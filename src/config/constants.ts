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
  title: "Before the Numbers - Don't Wait for the Diagnosis",
  description:
    'Before the Numbers is a health-awareness and metabolic-health education movement helping you understand early signals and trajectories before a diagnosis forces you to.',
  domain:
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
      ? process.env.NEXT_PUBLIC_SITE_URL.replace(/^https?:\/\//, '')
      : 'beforethenumbers.org',
  wordpressApiUrl:
    process.env.WORDPRESS_API_URL ||
    'https://public-api.wordpress.com/wp/v2/sites/diabetescareph.wordpress.com',
  author: 'Before the Numbers',
  brand: {
    master: 'Before the Numbers',
    tagline: "Don't wait for the diagnosis.",
    flagshipFramework: 'The Hidden Metabolic Clock',
  },
  social: {
    facebook: 'https://facebook.com/beforethenumbers',
    twitter: 'https://twitter.com/beforethenumbers',
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
 * Google Analytics (gtag.js) configuration settings.
 *
 * @usecase Controls Google tag initialization and measurement ID across site layouts.
 * @dependencies process.env.NEXT_PUBLIC_GA_ID.
 */
export const GA_CONFIG = {
  measurementId: process.env.NEXT_PUBLIC_GA_ID || 'G-Z3316RT5Z7',
};

/**
 * Community Discussion Board & Guardrails Configuration.
 *
 * @usecase Configures forum category taxonomy, impersonation blocklists, rate limiting, and safe conditional email alerts.
 */
export const COMMUNITY_CONFIG = {
  categories: [
    'Daily Sugar Tracking',
    'Low-GI Pinoy Meals',
    'Medications & Doctor Visits',
    'General Support',
  ],
  reservedAliases: [
    'admin',
    'moderator',
    'before the numbers',
    'beforethenumbers',
    'diabetescare',
    'diabetescare ph',
    'doctor',
    'dr.',
    'staff',
    'support',
    'system',
    'official',
  ],
  reportAutoQuarantineThreshold: 2,
  syncCodeExpiresMinutes: 15,
  emailNotificationsEnabled:
    process.env.ENABLE_COMMUNITY_EMAIL_NOTIFICATIONS === 'true' &&
    Boolean(process.env.RESEND_API_KEY),
};
