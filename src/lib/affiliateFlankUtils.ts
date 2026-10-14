import { IAffiliateRecommendation, IAuthority } from '@/types/learning';

/**
 * Flank distribution mapping for companion reading cards flanking the desktop video player.
 */
export interface FlankDistribution {
  leftBooks: IAffiliateRecommendation[];
  rightBooks: IAffiliateRecommendation[];
}

export interface ResolveRelatedOptions {
  topics?: string[];
  excludeTitles?: string[];
  authorities?: IAuthority[];
  limit?: number;
}

export interface ResolveFlankPanelsOptions {
  authorBooks: IAffiliateRecommendation[];
  authorityName?: string;
  topics?: string[];
  authorities?: IAuthority[];
  cardsPerSide?: number;
}

export interface FlankLayoutResult {
  leftBooks: IAffiliateRecommendation[];
  leftTitle: string;
  rightBooks: IAffiliateRecommendation[];
  rightTitle: string;
  allDisplayBooks: IAffiliateRecommendation[];
  inlineTitle: string;
}

/**
 * Resolves related reading materials matching the video's topic from across all database authorities.
 *
 * @param {ResolveRelatedOptions} options Matching criteria and exclusion list.
 * @returns {IAffiliateRecommendation[]} Ranked array of related affiliate reading items.
 */
export function resolveRelatedAffiliateBooks({
  topics = [],
  excludeTitles = [],
  authorities = [],
  limit = 4,
}: ResolveRelatedOptions): IAffiliateRecommendation[] {
  const candidateBooks: IAffiliateRecommendation[] = [];
  const seenTitles = new Set<string>();

  const normalizedExcludes = new Set(
    (excludeTitles || []).map((t) => t.toLowerCase().trim()).filter(Boolean)
  );

  // Harvest all unique affiliate recommendations from available authorities
  (authorities || []).forEach((auth) => {
    (auth.recommendedBooks || []).forEach((book) => {
      const key = (book.title || '').toLowerCase().trim();
      if (!key || normalizedExcludes.has(key) || seenTitles.has(key)) {
        return;
      }
      seenTitles.add(key);
      candidateBooks.push(book);
    });
  });

  if (candidateBooks.length === 0) {
    return [];
  }

  const normalizedTopics = (topics || [])
    .map((t) => t.toLowerCase().trim())
    .filter(Boolean);

  // Score candidate books against the video's curated topic taxonomy
  const scoredBooks = candidateBooks.map((book) => {
    let score = 0;
    const bookTopics = (book.topics || []).map((t) => t.toLowerCase().trim());
    const bookTitle = (book.title || '').toLowerCase();
    const bookDesc = (book.description || '').toLowerCase();

    normalizedTopics.forEach((topic) => {
      if (bookTopics.includes(topic)) {
        score += 15;
      } else if (bookTopics.some((bt) => bt.includes(topic) || topic.includes(bt))) {
        score += 10;
      }

      if (bookTitle.includes(topic)) {
        score += 8;
      }
      if (bookDesc.includes(topic)) {
        score += 5;
      }
    });

    return { book, score };
  });

  scoredBooks.sort((a, b) => b.score - a.score);

  return scoredBooks.slice(0, limit).map((s) => s.book);
}

/**
 * Symmetrically distributes affiliate items across left and right panels.
 *
 * @param {IAffiliateRecommendation[]} books Array of affiliate recommendations.
 * @returns {FlankDistribution} Partitioned left and right book sets.
 */
export function distributeFlankBooks(books?: IAffiliateRecommendation[]): FlankDistribution {
  if (!books || books.length === 0) {
    return { leftBooks: [], rightBooks: [] };
  }

  if (books.length === 1) {
    return { leftBooks: [], rightBooks: [books[0]] };
  }

  const leftBooks: IAffiliateRecommendation[] = [];
  const rightBooks: IAffiliateRecommendation[] = [];

  books.forEach((book, index) => {
    if (index % 2 === 0) {
      rightBooks.push(book);
    } else {
      leftBooks.push(book);
    }
  });

  return { leftBooks, rightBooks };
}

/**
 * Orchestrates desktop flank panels according to author volume and topic relevance:
 * 1. 0 Author Books: Both flanks display related topic readings.
 * 2. 1-2 Author Books (<= cardsPerSide): One flank displays author materials, opposite flank displays related readings.
 * 3. >2 Author Books (> cardsPerSide): Both flanks solely display author materials.
 *
 * @param {ResolveFlankPanelsOptions} options Input author books, authorities pool, and topic tags.
 * @returns {FlankLayoutResult} Computed left/right flank books and headers.
 */
export function resolveFlankPanels({
  authorBooks = [],
  authorityName,
  topics = [],
  authorities = [],
  cardsPerSide = 2,
}: ResolveFlankPanelsOptions): FlankLayoutResult {
  const authorCount = (authorBooks || []).length;
  const authorTitle = authorityName ? `By ${authorityName}` : "Author's Reading";

  // Case 1: Author has no books in database — Both sides display related reading
  if (authorCount === 0) {
    const related = resolveRelatedAffiliateBooks({
      topics,
      authorities,
      limit: cardsPerSide * 2,
    });

    const leftBooks = related.slice(0, cardsPerSide);
    const rightBooks = related.slice(cardsPerSide, cardsPerSide * 2);

    return {
      leftBooks,
      leftTitle: 'Related Reading',
      rightBooks,
      rightTitle: 'Related Reading',
      allDisplayBooks: related,
      inlineTitle: 'Related Reading & Protocols',
    };
  }

  // Case 2: Author has limited books (<= cardsPerSide)
  // One flank focuses solely on author's material, opposite flank on related topic readings
  if (authorCount <= cardsPerSide) {
    const excludeTitles = authorBooks.map((b) => b.title);
    const related = resolveRelatedAffiliateBooks({
      topics,
      excludeTitles,
      authorities,
      limit: cardsPerSide,
    });

    return {
      leftBooks: authorBooks,
      leftTitle: authorTitle,
      rightBooks: related,
      rightTitle: 'Related Reading',
      allDisplayBooks: [...authorBooks, ...related],
      inlineTitle: authorityName ? `Recommended Reading by ${authorityName}` : 'Recommended Reading',
    };
  }

  // Case 3: Author books exceed single flank space (> cardsPerSide)
  // Both left and right flanks are dedicated solely to the author's resources
  const { leftBooks, rightBooks } = distributeFlankBooks(authorBooks);

  return {
    leftBooks,
    leftTitle: authorTitle,
    rightBooks,
    rightTitle: authorTitle,
    allDisplayBooks: authorBooks,
    inlineTitle: `Recommended Reading by ${authorityName || 'Author'}`,
  };
}

/**
 * Event stop propagation utility for modals and links to prevent parent backdrop triggers.
 *
 * @param {React.SyntheticEvent} e React synthetic event.
 */
export function stopPropagation(e: React.SyntheticEvent): void {
  e.stopPropagation();
}
