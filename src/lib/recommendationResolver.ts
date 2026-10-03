/**
 * Domain Utility — Unified Recommendation Resolver.
 *
 * @usecase Single source of truth for resolving and cascading affiliate recommended books
 * across Server Components, Domain Services, and Client Video Player Modals.
 * Conforms to DRY and Single Responsibility Principles.
 */
import { IAuthority, IAffiliateRecommendation, ILearningResource } from '@/types/learning';

export interface ResourceRecommendationIdentifier {
  recommendedBooks?: IAffiliateRecommendation[];
  authorityId?: string;
  authorityName?: string;
  slug?: string;
}

/**
 * Normalizes input string for robust token and equality matching.
 */
function normalize(val?: string): string {
  if (!val) return '';
  return val
    .toLowerCase()
    .replace(/[.,\-_/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Matches an authority against an identifier using authorityId, name, or slug.
 */
export function matchAuthority(
  identifier: ResourceRecommendationIdentifier,
  authorities?: IAuthority[]
): IAuthority | null {
  if (!authorities || authorities.length === 0) return null;

  const rawAuthId = identifier.authorityId ? String(identifier.authorityId).trim() : '';
  const normAuthId = normalize(rawAuthId);
  const normAuthName = normalize(identifier.authorityName);
  const normSlug = normalize(identifier.slug);

  return (
    authorities.find((a) => {
      const aId = a._id ? String(a._id).trim() : '';
      const normAId = normalize(aId);
      const normAName = normalize(a.name);
      const normASlug = normalize(a.slug);

      // 1. Direct ID match
      if (rawAuthId && aId && aId === rawAuthId) return true;
      if (normAuthId && normAId && normAId === normAuthId) return true;

      // 2. ID matched against authority slug
      if (normAuthId && normASlug && normASlug === normAuthId) return true;

      // 3. Name matched against authority name or slug
      if (normAuthName && normAName && (normAName === normAuthName || normAName.includes(normAuthName) || normAuthName.includes(normAName))) return true;
      if (normAuthName && normASlug && normASlug === normAuthName) return true;

      // 4. Resource slug matched against authority slug
      if (normSlug && normASlug && normASlug === normSlug) return true;

      return false;
    }) || null
  );
}

/**
 * Resolves the final list of recommended books for a given resource.
 *
 * Cascade Priority:
 * 1. Explicit books directly assigned to the resource in MongoDB.
 * 2. Dynamic books cascaded from matched Authority in MongoDB.
 * 3. Empty array if none registered (database is the sole source of truth).
 */
export function resolveRecommendedBooks(
  resource: ResourceRecommendationIdentifier | Partial<ILearningResource>,
  authorities?: IAuthority[]
): IAffiliateRecommendation[] {
  // 1. Explicit resource-level books
  if (resource.recommendedBooks && resource.recommendedBooks.length > 0) {
    return resource.recommendedBooks;
  }

  // 2. Dynamic books cascaded from matched Authority in MongoDB
  if (authorities && authorities.length > 0) {
    const matched = matchAuthority(resource, authorities);
    if (matched && matched.recommendedBooks && matched.recommendedBooks.length > 0) {
      return matched.recommendedBooks;
    }
  }

  // Database is the sole source of truth — no hardcoded fallback
  return [];
}
