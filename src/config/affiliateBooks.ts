/**
 * Centralized Registry of Curated Metabolic Books & Clinical Protocols (Affiliate Monetization).
 *
 * @usecase Powers contextual affiliate recommendations inside the VideoPlayerModal,
 * author profiles, and the public Learning Hub reading shelf.
 */
import { IAffiliateRecommendation } from '@/types/learning';

export const AFFILIATE_DISCLOSURE =
  'Disclosure: Recommended books and protocols contain affiliate links. When you purchase through these links, you support our evidence-based advocacy at no extra cost to you.';

/**
 * Legacy compatibility stub: All recommendations are now strictly sourced from the MongoDB database.
 */
export function getRecommendedBooksForAuthority(
  _authorityNameOrSlug?: string
): IAffiliateRecommendation[] {
  return [];
}

/**
 * Legacy compatibility stub: All recommendations are now strictly sourced from the MongoDB database.
 */
export function getAllRecommendedBooks(): IAffiliateRecommendation[] {
  return [];
}

