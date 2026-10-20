import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';

/** Directory holding version-controlled legal markdown (lawyer-reviewed text lands here). */
export const LEGAL_CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'legal');

type LegalAccent = 'indigo' | 'purple';

export interface LegalMeta {
  title: string;
  metaTitle: string;
  description: string;
  badge: string;
  accent: LegalAccent;
  subtitle: string;
  effectiveDate: string;
  version: string;
  reviewedBy: string;
  backLabel: string;
  backHref: string;
  nextLabel: string;
  nextHref: string;
  /** Optional copyright line (used by footer.md). */
  copyright: string;
}

export interface LegalDocument {
  slug: string;
  meta: LegalMeta;
  /** Markdown body with {{placeholders}} already resolved. */
  body: string;
}

/**
 * Minimal front-matter parser (key: value lines). Avoids adding a dependency.
 *
 * @param raw Full markdown file content.
 * @returns Parsed key/value data and the remaining markdown body.
 */
export function parseFrontMatter(raw: string): { data: Record<string, string>; body: string } {
  if (!raw || typeof raw !== 'string') {
    return { data: {}, body: '' };
  }

  const normalized = raw.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { data: {}, body: normalized };
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line
      .slice(idx + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2');
    if (key) data[key] = value;
  }

  return { data, body: normalized.slice(match[0].length) };
}

/**
 * Formats an ISO date (YYYY-MM-DD) as "Month YYYY" in UTC so output is timezone-stable.
 */
export function formatEffectiveDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function resolvePlaceholders(text: string): string {
  const values: Record<string, string> = {
    domain: SITE_CONFIG.domain,
    siteUrl: `https://${SITE_CONFIG.domain}`,
    author: SITE_CONFIG.author,
    year: String(new Date().getFullYear()),
  };
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (full, key: string) => values[key] ?? full);
}

/**
 * Lists the slugs of all markdown files in a legal content directory.
 *
 * @param dir Directory to scan (defaults to the real legal content directory; injectable for tests).
 */
export function getAllLegalSlugs(dir: string = LEGAL_CONTENT_DIR): string[] {
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

function isValidIsoDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function buildLegalDocument(slug: string, dir: string): LegalDocument {
  const filePath = path.join(dir, `${slug}.md`);
  if (!/^[a-z0-9_-]+$/i.test(slug) || !fs.existsSync(filePath)) {
    throw new Error(`Legal document not found: "${slug}"`);
  }

  const { data, body } = parseFrontMatter(fs.readFileSync(filePath, 'utf8'));

  if (!isValidIsoDate(data.effectiveDate)) {
    throw new Error(`Legal document "${slug}" is missing a valid effectiveDate (YYYY-MM-DD)`);
  }
  if (!data.title) {
    throw new Error(`Legal document "${slug}" is missing a title`);
  }
  if (!data.version) {
    throw new Error(`Legal document "${slug}" is missing a version`);
  }
  if (data.accent && data.accent !== 'indigo' && data.accent !== 'purple') {
    throw new Error(`Legal document "${slug}" has an unknown accent "${data.accent}" (indigo | purple)`);
  }

  const meta: LegalMeta = {
    title: resolvePlaceholders(data.title),
    metaTitle: resolvePlaceholders(data.metaTitle || data.title),
    description: resolvePlaceholders(data.description || ''),
    badge: resolvePlaceholders(data.badge || 'Legal'),
    accent: data.accent === 'purple' ? 'purple' : 'indigo',
    subtitle: resolvePlaceholders(data.subtitle || ''),
    effectiveDate: data.effectiveDate,
    version: data.version,
    reviewedBy: data.reviewedBy || '',
    backLabel: data.backLabel || '← Back to Home',
    backHref: data.backHref || '/',
    nextLabel: data.nextLabel || '',
    nextHref: data.nextHref || '',
    copyright: resolvePlaceholders(data.copyright || ''),
  };

  return { slug, meta, body: resolvePlaceholders(body) };
}

const documentCache = new Map<string, LegalDocument>();

/**
 * Loads and validates a legal markdown document.
 *
 * Results for the real content directory are memoized in production only (the global footer reads
 * footer.md on every render); in dev/test the file is re-read so markdown edits show up immediately.
 *
 * @param slug File name without extension (e.g. "privacy").
 * @param dir Content directory (defaults to src/content/legal; injectable for tests).
 * @throws If the file is missing or required front matter (title, version, valid effectiveDate) is absent.
 */
export function getLegalDocument(slug: string, dir: string = LEGAL_CONTENT_DIR): LegalDocument {
  const cacheable = process.env.NODE_ENV === 'production' && dir === LEGAL_CONTENT_DIR;
  if (cacheable) {
    const cached = documentCache.get(slug);
    if (cached) return cached;
  }

  const doc = buildLegalDocument(slug, dir);
  if (cacheable) documentCache.set(slug, doc);
  return doc;
}

/**
 * Builds Next.js page metadata for a markdown-driven legal page (single source for title/description).
 *
 * @param doc Loaded legal document.
 * @param canonicalPath Self-referencing canonical path, e.g. "/privacy".
 */
export function buildLegalMetadata(doc: LegalDocument, canonicalPath: string): Metadata {
  const url = `https://${SITE_CONFIG.domain}${canonicalPath}`;
  return {
    title: doc.meta.metaTitle,
    description: doc.meta.description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      title: doc.meta.metaTitle,
      description: doc.meta.description,
      url,
      type: 'website',
      siteName: SITE_CONFIG.author,
    },
    twitter: {
      card: 'summary',
      title: doc.meta.metaTitle,
      description: doc.meta.description,
    },
  };
}
