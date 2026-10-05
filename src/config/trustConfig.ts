/**
 * Trust & Governance Configuration Data.
 *
 * @usecase Centralizes Editorial Policy curation standards, transparent public corrections history,
 * and trust navigation links for compliance with Google E-E-A-T, RA 10173, and pure medical curation.
 */

export interface ICorrectionEntry {
  date: string;
  pageTitle: string;
  pageUrl: string;
  type: 'Clarification' | 'Clinical Hedging' | 'Correction' | 'Update';
  description: string;
  reviewedBy: string;
}

export const CORRECTIONS_LOG: ICorrectionEntry[] = [
  {
    date: 'October 2026',
    pageTitle: 'Phase 0 Site-Wide Medical Hedging & Safety Revision',
    pageUrl: '/',
    type: 'Clinical Hedging',
    description: 'Sanitized unhedged phrases including "last biomarker" and absolute 10-15 year timelines; replaced "reversal" with "remission" and added ubiquitous clinical safety boxes for medication and hypoglycemia precautions.',
    reviewedBy: 'Editorial & Clinical Curation Desk',
  },
  {
    date: 'October 2026',
    pageTitle: 'Blog to Community Forum Transition',
    pageUrl: '/community',
    type: 'Update',
    description: 'Transitioned historical subjective lifestyle articles from the educational index into peer-to-peer community threads under Founder attribution (#FOUNDER) to clearly separate clinical evidence curation from lived experience.',
    reviewedBy: 'Founder & Editorial Desk',
  },
  {
    date: 'October 2026',
    pageTitle: 'Pure Curation Model & Authority Syndication',
    pageUrl: '/learn',
    type: 'Update',
    description: 'Standardized bylines attributing verified clinical authorities (Dr. Bikman, Dr. Fung, Dr. Berry, Dr. Jamnadas) across all curated video lectures and scientific summaries, backed by strict evidence curation standards.',
    reviewedBy: 'Editorial & Clinical Curation Desk',
  },
];

export interface INavLink {
  href: string;
  label: string;
}

export const MAIN_FOOTER_LINKS: INavLink[] = [
  { href: '/', label: 'Home' },
  { href: '/hidden-clock', label: 'The Hidden Clock' },
  { href: '/learn', label: 'Learning Hub' },
  { href: '/glycosense', label: 'Tools' },
  { href: '/ph', label: 'Philippines (PH)' },
];

export const TRUST_NAV_LINKS: INavLink[] = [
  { href: '/about', label: 'About Us' },
  { href: '/editorial-policy', label: 'Editorial Policy' },
  { href: '/corrections', label: 'Corrections' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
];

export const ALL_FOOTER_LINKS: INavLink[] = [
  ...MAIN_FOOTER_LINKS,
  ...TRUST_NAV_LINKS,
];
