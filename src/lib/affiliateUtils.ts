/**
 * Utility helpers for managing, normalizing, and verifying affiliate and book recommendation URLs.
 *
 * @usecase Ensures robust affiliate attribution across Amazon (dp/ASIN, amzn.to shortlinks)
 * and third-party metabolic protocol networks without breaking links or manual errors.
 */

export const DEFAULT_AMAZON_AFFILIATE_TAG =
  process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_TAG ||
  process.env.AMAZON_AFFILIATE_TAG ||
  '';

/**
 * Ensures a product or resource URL contains the appropriate affiliate tracking tag.
 * - Leaves `amzn.to` SiteStripe shortlinks untouched (they already encode the affiliate tag perpetually).
 * - Leaves non-Amazon external protocol URLs untouched.
 * - Detects raw Amazon product links (`amazon.com`, `amazon.co.uk`, etc.) and appends `?tag=` if tag is provided.
 * - Does NOT invent or assume a fallback tag if none is configured.
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

    const tag = (customTag || DEFAULT_AMAZON_AFFILIATE_TAG || '').trim();
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
 * Generates the permanent high-resolution Amazon product image URL from an ASIN or Amazon product URL.
 * Uses Amazon's official permanent Product Image API CDN (`/images/P/{ASIN}.01.LZZZZZZZ.jpg`),
 * which is stable, perpetual, and does not expire or rot like temporary `/images/I/` hashes.
 */
export function getAmazonCoverUrl(asinOrUrl: string): string | null {
  if (!asinOrUrl || typeof asinOrUrl !== 'string') return null;
  const trimmed = asinOrUrl.trim();
  const asin = /^[A-Z0-9]{10}$/i.test(trimmed) ? trimmed.toUpperCase() : extractAmazonAsin(trimmed);
  if (!asin) return null;
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.01.LZZZZZZZ.jpg`;
}
