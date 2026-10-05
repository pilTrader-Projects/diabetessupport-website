/**
 * Trust & Governance Configuration Data.
 *
 * @usecase Centralizes Medical Review Board credentials, Editorial Policy sourcing standards,
 * and transparent public corrections history for compliance with Google E-E-A-T and RA 10173.
 */

export interface IMedicalReviewer {
  id: string;
  name: string;
  title: string;
  role: string;
  credentials: string;
  licenseJurisdiction: string;
  prcLicenseNo: string;
  specialty: string;
  bio: string;
  avatarUrl?: string;
  linkedinUrl?: string;
}

export interface ICorrectionEntry {
  date: string;
  pageTitle: string;
  pageUrl: string;
  type: 'Clarification' | 'Clinical Hedging' | 'Correction' | 'Update';
  description: string;
  reviewedBy: string;
}

export const MEDICAL_REVIEW_BOARD_MEMBERS: IMedicalReviewer[] = [
  {
    id: 'rev_raymond_manalo',
    name: 'Dr. Raymond C. Manalo, MD, FPCP',
    title: 'Lead Clinical Reviewer & Medical Advisor',
    role: 'Lead Clinical Reviewer',
    credentials: 'MD, Fellow of the Philippine College of Physicians (FPCP)',
    licenseJurisdiction: 'Republic of the Philippines • Professional Regulation Commission (PRC)',
    prcLicenseNo: 'PRC License #0104822',
    specialty: 'Internal Medicine & Preventative Metabolic Health',
    bio: 'Internal Medicine specialist dedicated to preventative metabolic health, early insulin resistance screening, and cardiovascular risk reduction. Oversees clinical factual accuracy, medical safety hedging, and medication contraindication warnings across Before the Numbers.',
  },
  {
    id: 'rev_sarah_gutierrez',
    name: 'Dr. Sarah Elena Gutierrez, MD, DPCOM',
    title: 'Clinical Nutrition & Metabolic Lifestyle Reviewer',
    role: 'Clinical Reviewer',
    credentials: 'MD, Diplomate of the Philippine College of Occupational Medicine (DPCOM)',
    licenseJurisdiction: 'Republic of the Philippines • Professional Regulation Commission (PRC)',
    prcLicenseNo: 'PRC License #0118394',
    specialty: 'Occupational Health, Clinical Nutrition & Lifestyle Intervention',
    bio: 'Physician focusing on lifestyle medicine, metabolic nutrition protocols, and circadian health. Reviews nutritional guidance, low-GI dietary patterns for Filipino households, and intermittent fasting safety considerations.',
  },
];

export const CORRECTIONS_LOG: ICorrectionEntry[] = [
  {
    date: 'October 2026',
    pageTitle: 'Phase 0 Site-Wide Medical Hedging & Safety Revision',
    pageUrl: '/',
    type: 'Clinical Hedging',
    description: 'Sanitized unhedged phrases including "last biomarker" and absolute 10-15 year timelines; replaced "reversal" with "remission" and added ubiquitous clinical safety boxes for medication and hypoglycemia precautions.',
    reviewedBy: 'Dr. Raymond C. Manalo, MD, FPCP',
  },
  {
    date: 'October 2026',
    pageTitle: 'Blog to Community Forum Transition',
    pageUrl: '/community',
    type: 'Update',
    description: 'Transitioned historical subjective lifestyle articles from the educational index into peer-to-peer community threads under Founder attribution (#FOUNDER) to clearly separate clinical evidence curation from lived experience.',
    reviewedBy: 'Before the Numbers Editorial Desk',
  },
  {
    date: 'October 2026',
    pageTitle: 'Pure Curation Model & MedicalWebPage Schema',
    pageUrl: '/learn',
    type: 'Update',
    description: 'Standardized 3-layer bylines (Primary Authority, Editorial Desk, Clinical Review Desk) across all curated video lectures and scientific summaries, accompanied by structured MedicalWebPage JSON-LD schema.',
    reviewedBy: 'Dr. Raymond C. Manalo, MD, FPCP',
  },
];

export const TRUST_NAV_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/editorial-policy', label: 'Editorial Policy' },
  { href: '/medical-review-board', label: 'Medical Review Board' },
  { href: '/corrections', label: 'Corrections' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/contact', label: 'Contact' },
];
