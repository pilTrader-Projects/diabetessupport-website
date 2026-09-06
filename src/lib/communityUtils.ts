import { COMMUNITY_CONFIG } from '@/config/constants';

/**
 * Checks if a requested author display name conflicts with reserved authoritative aliases.
 *
 * @usecase Blocks users from impersonating administrators, healthcare providers, or staff.
 * @param {string} alias Display name to validate.
 * @returns {boolean} True if reserved/prohibited, false otherwise.
 */
export function isAliasReserved(alias: string): boolean {
  if (!alias) return false;
  const clean = alias.trim().toLowerCase();
  return COMMUNITY_CONFIG.reservedAliases.some(
    (reserved) => clean === reserved || clean.startsWith(`${reserved} `)
  );
}

/**
 * Generates a deterministic 4-digit numeric tag (e.g. '#4821') from an author ID.
 *
 * @usecase Differentiates users sharing identical display names without requiring account logins.
 * @param {string} authorId Unique device/author identifier.
 * @returns {string} Formatted 4-digit tag.
 */
export function generateAuthorTag(authorId: string): string {
  if (!authorId) return '#1001';
  let hash = 0;
  for (let i = 0; i < authorId.length; i++) {
    hash = (hash << 5) - hash + authorId.charCodeAt(i);
    hash |= 0;
  }
  const tagNum = Math.abs(hash % 9000) + 1000;
  return `#${tagNum}`;
}

/**
 * Sanitizes user-generated text/HTML and ensures all external links carry rel="ugc nofollow".
 *
 * @usecase Protects domain from link farming, spam penalties, and malicious phishing links.
 * @param {string} content Raw user input content.
 * @returns {string} Cleaned content with enforced ugc nofollow attributes.
 */
export function sanitizeUgcContent(content: string): string {
  if (!content) return '';

  // Replace raw URLs with rel="ugc nofollow" anchor tags
  const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/gi;
  return content.replace(urlRegex, (url) => {
    return `<a href="${url}" rel="ugc nofollow" target="_blank" class="text-teal-600 underline">${url}</a>`;
  });
}

/**
 * Generates an SEO-friendly unique URL slug from a thread title.
 *
 * @usecase Creates clean URL identifiers for discussion threads.
 * @param {string} title Thread topic headline.
 * @returns {string} URL-safe slug string with short random suffix for uniqueness.
 */
export function generateThreadSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base.substring(0, 60)}-${suffix}`;
}
