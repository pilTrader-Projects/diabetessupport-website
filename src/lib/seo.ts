import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';

export const SITE_NAME = 'Before the Numbers';
export const SITE_URL = `https://${SITE_CONFIG.domain}`;

export interface BuildMetadataOptions {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageAlt?: string;
  noIndex?: boolean;
  type?: 'website' | 'article';
}

/**
 * Normalizes title so that the brand site name "Before the Numbers"
 * appears exactly once.
 *
 * Rules:
 * - If title already includes "Before the Numbers" once, preserve it.
 * - If title includes multiple occurrences of "Before the Numbers", deduplicate trailing repetitions.
 * - If title does not include "Before the Numbers", append " | Before the Numbers".
 */
export function formatTitle(title: string): string {
  if (!title || typeof title !== 'string') {
    return SITE_NAME;
  }
  const trimmed = title.trim();
  const siteRegex = /Before the Numbers/gi;
  const matches = trimmed.match(siteRegex);
  const count = matches ? matches.length : 0;

  if (count === 1) {
    return trimmed;
  }

  if (count > 1) {
    // Strip trailing repetitions of ` | Before the Numbers`
    let cleaned = trimmed;
    while (/\s*\|\s*Before the Numbers\s*$/i.test(cleaned)) {
      cleaned = cleaned.replace(/\s*\|\s*Before the Numbers\s*$/i, '').trim();
    }
    const remainingCount = (cleaned.match(siteRegex) || []).length;
    if (remainingCount === 1) {
      return cleaned;
    }
    return cleaned ? `${cleaned} | ${SITE_NAME}` : SITE_NAME;
  }

  // count === 0: append site name once
  return `${trimmed} | ${SITE_NAME}`;
}

/**
 * Normalizes a canonical URL given a path.
 * Ensures consistent https://www.beforethenumbers.org base, self-referencing, no trailing slashes.
 */
export function formatCanonicalUrl(path: string): string {
  if (!path || path === '/') {
    return SITE_URL;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slash if present (except root)
  const normalized = cleanPath.length > 1 && cleanPath.endsWith('/')
    ? cleanPath.slice(0, -1)
    : cleanPath;
  return `${SITE_URL}${normalized}`;
}

/**
 * Core SEO metadata factory for Next.js App Router public pages.
 *
 * Enforces:
 * 1. Single occurrence of site name in title.
 * 2. Self-referencing canonical URL matching og:url.
 * 3. Complete OpenGraph and Twitter card metadata.
 * 4. Robots directive (index: true, follow: true by default, or noIndex).
 */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    title,
    description,
    path,
    keywords,
    image,
    imageWidth = 1200,
    imageHeight = 630,
    imageAlt,
    noIndex = false,
    type = 'website',
  } = options;

  const fullTitle = formatTitle(title);
  const canonicalUrl = formatCanonicalUrl(path);
  const defaultImage = `${SITE_URL}/icons/icon-512x512.png`;
  const resolvedImage = image
    ? image.startsWith('http')
      ? image
      : `${SITE_URL}${image.startsWith('/') ? image : `/${image}`}`
    : defaultImage;

  return {
    title: fullTitle,
    description,
    ...(keywords && keywords.length ? { keywords } : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.author || SITE_NAME,
      type,
      images: [
        {
          url: resolvedImage,
          width: imageWidth,
          height: imageHeight,
          alt: imageAlt || fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [resolvedImage],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
