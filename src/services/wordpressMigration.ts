import { IPost } from '@/types/blog';

/**
 * Raw WordPress REST API v2 Post Payload interface definition.
 * @usecase Strongly types API response fields from diabetescareph.wordpress.com.
 */
export interface WordPressApiPostPayload {
  id: number;
  date: string;
  slug: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt: { rendered: string };
  jetpack_featured_media_url?: string;
  featured_media_url?: string;
  tags?: (string | number)[];
}

/**
 * Strips HTML formatting tags, trailing ellipses, and extra whitespace from raw HTML string excerpts.
 *
 * @usecase Converts WordPress rendered HTML excerpt into clean plain text for SEO meta tags and card summaries.
 * @param {string} html String containing raw HTML tags or HTML entity codes.
 * @dependencies None (pure utility string parser).
 * @returns {string} Cleaned plain text excerpt without HTML tags or trailing HTML entities.
 */
export function extractPlainTextExcerpt(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // Strip HTML elements
    .replace(/&(hellip|#8230|nbsp|amp|lt|gt);/g, (match) => {
      if (match.includes('amp')) return '&';
      if (match.includes('lt')) return '<';
      if (match.includes('gt')) return '>';
      return '';
    })
    .trim();
}

/**
 * Transforms a raw WordPress API post object into our domain IPost schema format.
 *
 * @usecase Prepares legacy WordPress content for MongoDB database insertion.
 * @param {WordPressApiPostPayload} wpPost Raw post object fetched from WordPress REST API.
 * @param {string[]} categoryNames Array of human-readable category names associated with the post.
 * @param {Map<string, string>} categoryIdMap Mapping lookup table from category name to MongoDB ObjectId.
 * @dependencies extractPlainTextExcerpt helper function, IPost interface.
 * @returns {Partial<IPost>} Standardized domain post payload ready for Mongoose model creation.
 */
export function transformWordPressPost(
  wpPost: WordPressApiPostPayload,
  categoryNames: string[] = [],
  categoryIdMap: Map<string, string> = new Map()
): Partial<IPost> {
  const title = wpPost.title?.rendered ? wpPost.title.rendered.trim() : 'Untitled Post';
  const slug = wpPost.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const content = wpPost.content?.rendered || '';
  
  let excerpt = extractPlainTextExcerpt(wpPost.excerpt?.rendered || '');
  if (!excerpt && content) {
    excerpt = extractPlainTextExcerpt(content).slice(0, 160).trim();
  }

  const featuredImage =
    wpPost.jetpack_featured_media_url ||
    wpPost.featured_media_url ||
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=1200&q=80';

  const tags = (wpPost.tags || []).map((t) => String(t).trim().toLowerCase());
  
  const primaryCategoryName = categoryNames.length > 0 ? categoryNames[0] : '';
  const categoryId = categoryIdMap.get(primaryCategoryName);

  const publishedDate = wpPost.date
    ? new Date(wpPost.date.endsWith('Z') ? wpPost.date : `${wpPost.date}Z`)
    : new Date();

  return {
    title,
    slug,
    content,
    excerpt,
    featuredImage,
    category: categoryId as any,
    tags,
    status: 'published',
    wordpressId: wpPost.id,
    publishedAt: publishedDate,
  };
}
