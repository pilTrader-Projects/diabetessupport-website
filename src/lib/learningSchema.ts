import { SITE_CONFIG } from '@/config/constants';
import { ILearningResource, EvidenceLevel } from '@/types/learning';

/**
 * Default practical discussion questions for physician consultations.
 *
 * @usecase Guides patients during clinical visits without providing direct medical instructions.
 */
export const DEFAULT_DOCTOR_QUESTIONS: string[] = [
  'Given my recent fasting blood glucose, HbA1c, or insulin trajectory, would a low-carbohydrate or time-restricted eating strategy be appropriate for my regimen?',
  'If I adjust my carbohydrate intake or fasting windows, how should we monitor and adjust my diabetes or blood pressure medications to prevent hypoglycemia?',
  'What additional biomarkers (such as fasting insulin, HOMA-IR, or ApoB) should we evaluate to track metabolic progress beyond standard fasting glucose?',
];

/**
 * Resolves the structured evidence hierarchy level for a learning resource.
 *
 * @usecase Classifies resources into clinical guidelines, meta-analyses, RCTs, lectures, or observational evidence.
 * @param {Partial<ILearningResource>} resource The learning resource entity.
 * @returns {EvidenceLevel} Standardized evidence hierarchy category.
 */
export function resolveEvidenceLevel(resource: Partial<ILearningResource>): EvidenceLevel {
  if (resource.evidenceLevel) {
    return resource.evidenceLevel;
  }

  const title = (resource.title || '').toLowerCase();
  const topics = (resource.topics || []).map((t) => t.toLowerCase());

  if (resource.type === 'study') {
    if (title.includes('meta-analysis') || title.includes('systematic review')) {
      return 'Systematic Review & Meta-Analysis';
    }
    if (title.includes('guideline') || title.includes('consensus') || title.includes('standard of care')) {
      return 'Consensus Guideline';
    }
    return 'Randomized Controlled Trial (RCT)';
  }

  if (title.includes('guideline') || topics.includes('guidelines')) {
    return 'Consensus Guideline';
  }

  if (resource.type === 'podcast') {
    return 'Expert Clinical Lecture';
  }

  return 'Expert Clinical Lecture';
}

/**
 * Builds Schema.org compliant MedicalWebPage JSON-LD schema for the Learning Hub directory.
 *
 * @usecase Declares 3-layer authorship and structured medical metadata for GEO/AEO and Google Search Rich Results.
 * @param {ILearningResource[]} resources Array of published learning resources.
 * @returns {Record<string, any>} Schema.org MedicalWebPage JSON-LD object.
 */
export function buildLearningHubMedicalSchema(resources: ILearningResource[]): Record<string, any> {
  const hubUrl = `https://${SITE_CONFIG.domain}/learn`;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'Before the Numbers Learning & Evidence Hub',
    description:
      'Curated library of evidence-based medical lectures, clinical trials, and protocols on metabolic health and insulin dynamics.',
    url: hubUrl,
    editor: {
      '@type': 'Organization',
      name: 'Before the Numbers Editorial Desk',
      url: `https://${SITE_CONFIG.domain}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Before the Numbers',
      url: `https://${SITE_CONFIG.domain}`,
      logo: {
        '@type': 'ImageObject',
        url: `https://${SITE_CONFIG.domain}/images/logo.png`,
      },
    },
    reviewedBy: {
      '@type': 'Organization',
      name: 'Before the Numbers Clinical Review Desk',
      url: `https://${SITE_CONFIG.domain}/about`,
    },
    medicalAudience: 'Patient',
    aspect: ['Overview', 'Etiology', 'Pathophysiology', 'Prevention'],
    hasPart: resources.slice(0, 15).map((r) => ({
      '@type': r.type === 'video' ? 'VideoObject' : 'MedicalWebPage',
      name: r.title,
      description: r.summary,
      url: `${hubUrl}?resource=${encodeURIComponent(r.slug)}`,
      author: {
        '@type': 'Person',
        name: r.authorityName || 'Contributing Medical Authority',
      },
      evidenceLevel: resolveEvidenceLevel(r),
    })),
  };
}

/**
 * Builds Schema.org compliant VideoObject JSON-LD schema utilizing privacy-safe youtube-nocookie.com embeds.
 *
 * @usecase Optimizes video search indexing with verified authority authorship and privacy-safe playback.
 * @param {ILearningResource} resource Curated video resource.
 * @returns {Record<string, any>} Schema.org VideoObject JSON-LD object.
 */
export function buildResourceVideoSchema(resource: ILearningResource): Record<string, any> {
  const embedUrl = resource.embedId
    ? `https://www.youtube-nocookie.com/embed/${resource.embedId}`
    : resource.sourceUrl;

  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: resource.title,
    description: resource.summary,
    thumbnailUrl: [
      resource.thumbnailUrl || `https://${SITE_CONFIG.domain}/images/default-og.jpg`,
    ],
    uploadDate: resource.publishedAt
      ? new Date(resource.publishedAt).toISOString()
      : new Date().toISOString(),
    embedUrl,
    author: {
      '@type': 'Person',
      name: resource.authorityName,
      jobTitle: resource.authorityTitle || 'Medical Authority',
    },
    editor: {
      '@type': 'Organization',
      name: resource.editorialDesk || 'Before the Numbers Editorial Desk',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Before the Numbers',
      url: `https://${SITE_CONFIG.domain}`,
    },
  };
}
