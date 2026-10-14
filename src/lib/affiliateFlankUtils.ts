import { IAffiliateRecommendation } from '@/types/learning';

/**
 * Flank distribution mapping for companion reading cards flanking the desktop video player.
 */
export interface FlankDistribution {
  leftBooks: IAffiliateRecommendation[];
  rightBooks: IAffiliateRecommendation[];
}

/**
 * Distributes affiliate recommended books symmetrically across the left and right flanks
 * of the video player modal on wide desktop viewports.
 *
 * @param {IAffiliateRecommendation[]} books Array of affiliate recommendations for the resource or authority.
 * @returns {FlankDistribution} Partitioned left and right book sets.
 */
export function distributeFlankBooks(books?: IAffiliateRecommendation[]): FlankDistribution {
  if (!books || books.length === 0) {
    return { leftBooks: [], rightBooks: [] };
  }

  // Single book is anchored to the right flank for primary reading flow
  if (books.length === 1) {
    return { leftBooks: [], rightBooks: [books[0]] };
  }

  const leftBooks: IAffiliateRecommendation[] = [];
  const rightBooks: IAffiliateRecommendation[] = [];

  books.forEach((book, index) => {
    // Alternating distribution: right flank gets first book, left gets second, etc.
    if (index % 2 === 0) {
      rightBooks.push(book);
    } else {
      leftBooks.push(book);
    }
  });

  return { leftBooks, rightBooks };
}

/**
 * Event stop propagation utility for modals and links to prevent parent backdrop triggers.
 *
 * @param {React.SyntheticEvent} e React synthetic event.
 */
export function stopPropagation(e: React.SyntheticEvent): void {
  e.stopPropagation();
}

