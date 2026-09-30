/**
 * Utility helpers for managing, normalizing, and verifying affiliate and book recommendation URLs.
 *
 * @usecase Ensures robust affiliate attribution across Amazon (dp/ASIN, amzn.to shortlinks)
 * and third-party metabolic protocol networks without breaking links or manual errors.
 */

export const DEFAULT_AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ||
  process.env.AMAZON_AFFILIATE_TAG ||
  'diabetes-code';

/**
 * Ensures a product or resource URL contains the appropriate affiliate tracking tag.
 * - Leaves `amzn.to` SiteStripe shortlinks untouched (they already encode the affiliate tag perpetually).
 * - Leaves non-Amazon external protocol URLs untouched.
 * - Detects raw Amazon product links (`amazon.com`, `amazon.co.uk`, etc.) and appends `?tag=` if missing.
 */
export function ensureAffiliateUrl(rawUrl: string, customTag?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // Case 1: amzn.to SiteStripe shortlinks already have affiliate tag baked in perpetually
  if (trimmed.includes('amzn.to/')) {
    return trimmed;
  }

  // Case 2: Standard Amazon URLs
  const amazonDomainRegex = /(?:https?:\/\/)?(?:www\.)?(?:smile\.)?amazon\.(?:com|co\.uk|ca|de|com\.au|es|fr|it|co\.jp|in)/i;
  if (amazonDomainRegex.test(trimmed)) {
    // If it already contains a tag parameter, keep it as-is
    if (/[?&]tag=([^&#]+)/i.test(trimmed)) {
      return trimmed;
    }

    const tag = (customTag || DEFAULT_AMAZON_AFFILIATE_TAG || 'diabetes-code').trim();
    if (!tag) return trimmed;

    try {
      // Ensure protocol is present for valid URL parsing
      const validUrlStr = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      const url = new URL(validUrlStr);
      url.searchParams.set('tag', tag);
      return url.toString();
    } catch {
      // Fallback string concatenation if URL parsing fails
      const separator = trimmed.includes('?') ? '&' : '?';
      return `${trimmed}${separator}tag=${encodeURIComponent(tag)}`;
    }
  }

  // Case 3: External program or custom protocol URL (leave intact)
  return trimmed;
}

/**
 * Extracts a 10-character Amazon Standard Identification Number (ASIN) from an Amazon URL.
 */
export function extractAmazonAsin(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:\/dp\/|\/gp\/product\/|\/d\/)([A-Z0-9]{10})/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Constructs a direct canonical Amazon product page link with tracking tag.
 */
export function buildAmazonProductUrl(asin: string, tag?: string): string {
  const cleanAsin = (asin || '').trim().toUpperCase();
  const affiliateTag = (tag || DEFAULT_AMAZON_AFFILIATE_TAG || 'diabetes-code').trim();
  return `https://www.amazon.com/dp/${cleanAsin}?tag=${encodeURIComponent(affiliateTag)}`;
}
