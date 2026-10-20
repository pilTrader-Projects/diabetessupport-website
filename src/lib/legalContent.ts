import fs from 'fs';
import path from 'path';
import { SITE_CONFIG } from '@/config/constants';

/** Directory holding version-controlled legal markdown (lawyer-reviewed text lands here). */
export const LEGAL_CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'legal');

export type LegalAccent = 'indigo' | 'purple';

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
 * Lists the slugs of all markdown files in the legal content directory.
 */
export function getAllLegalSlugs(): string[] {
  return fs
    .readdirSync(LEGAL_CONTENT_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));
}

/**
 * Loads and validates a legal markdown document.
 *
 * @param slug File name without extension (e.g. "privacy").
 * @throws If the file is missing or required front matter (title, version, valid effectiveDate) is absent.
 */
export function getLegalDocument(slug: string): LegalDocument {
  const filePath = path.join(LEGAL_CONTENT_DIR, `${slug}.md`);
  if (!/^[a-z0-9_-]+$/i.test(slug) || !fs.existsSync(filePath)) {
    throw new Error(`Legal document not found: "${slug}"`);
  }

  const { data, body } = parseFrontMatter(fs.readFileSync(filePath, 'utf8'));

  if (!data.effectiveDate || !/^\d{4}-\d{2}-\d{2}$/.test(data.effectiveDate)) {
    throw new Error(`Legal document "${slug}" is missing a valid effectiveDate (YYYY-MM-DD)`);
  }
  if (!data.title) {
    throw new Error(`Legal document "${slug}" is missing a title`);
  }
  if (!data.version) {
    throw new Error(`Legal document "${slug}" is missing a version`);
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
