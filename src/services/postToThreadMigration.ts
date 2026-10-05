import { IPost } from '@/types/blog';
import { IThread } from '@/types/community';
import { Post } from '@/models/Post';
import { Thread } from '@/models/Thread';
import dbConnect from '@/lib/dbConnect';

export const FOUNDER_AUTHOR_ALIAS = 'Founder & Advocate';
export const FOUNDER_AUTHOR_TAG = '#FOUNDER';
export const FOUNDER_AUTHOR_ID = 'usr_founder_001';

export const COMMUNITY_DISCUSSION_PROMPT =
  'Have you noticed similar patterns or challenges in your own journey? What has worked best for you? Share your experience or questions below!';

/**
 * Maps WordPress / Blog categories to Community Forum discussion categories.
 *
 * @param {string} [postCategory] Original category of the blog post.
 * @returns {string} Matched community forum category.
 */
export function mapPostCategoryToCommunityCategory(postCategory?: string): string {
  if (!postCategory) return 'General Support';

  const lower = postCategory.toLowerCase().trim();

  if (
    lower.includes('meal') ||
    lower.includes('recipe') ||
    lower.includes('food') ||
    lower.includes('diet') ||
    lower.includes('nutrition') ||
    lower.includes('ulam') ||
    lower.includes('rice')
  ) {
    return 'Low-GI Pinoy Meals';
  }

  if (
    lower.includes('sugar') ||
    lower.includes('glucose') ||
    lower.includes('fasting') ||
    lower.includes('tracking') ||
    lower.includes('monitor') ||
    lower.includes('test') ||
    lower.includes('spike') ||
    lower.includes('clock')
  ) {
    return 'Daily Sugar Tracking';
  }

  if (
    lower.includes('medication') ||
    lower.includes('doctor') ||
    lower.includes('visit') ||
    lower.includes('checkup') ||
    lower.includes('hospital') ||
    lower.includes('lab') ||
    lower.includes('metformin') ||
    lower.includes('insulin')
  ) {
    return 'Medications & Doctor Visits';
  }

  return 'General Support';
}

/**
 * Cleans raw WordPress HTML markup and appends a community discussion prompt.
 *
 * @param {string} content Raw HTML content from WordPress post.
 * @returns {string} Clean conversational markdown/text for community thread.
 */
export function cleanPostContentForThread(content: string): string {
  if (!content) return '';

  let cleaned = content
    // Remove WordPress Gutenberg block comments
    .replace(/<!--\s*\/?wp:[^>]*-->/gi, '')
    // Strip common wrapper tags while preserving newlines
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]*>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#8230;/gi, '...')
    .replace(/&hellip;/gi, '...')
    .replace(/&#8217;/gi, "'")
    .replace(/&#8220;/gi, '"')
    .replace(/&#8221;/gi, '"')
    // Collapse excess newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Append community engagement prompt
  const fullContent = `${cleaned}\n\n---\n**💬 Community Discussion:**\n${COMMUNITY_DISCUSSION_PROMPT}`;

  // Enforce Thread schema limit (10,000 characters)
  if (fullContent.length > 9900) {
    return fullContent.substring(0, 9900) + '...';
  }

  return fullContent;
}

/**
 * Transforms an IPost domain document into an IThread creation payload.
 *
 * @param {IPost} post Source blog post document.
 * @returns {Partial<IThread>} Community thread payload with Founder authorship.
 */
export function transformPostToThreadPayload(post: IPost): Partial<IThread> {
  const truncatedTitle = post.title.trim().substring(0, 200);

  return {
    title: truncatedTitle,
    slug: post.slug.trim().toLowerCase(),
    content: cleanPostContentForThread(post.content),
    category: mapPostCategoryToCommunityCategory(post.category),
    authorAlias: FOUNDER_AUTHOR_ALIAS,
    authorTag: FOUNDER_AUTHOR_TAG,
    authorId: FOUNDER_AUTHOR_ID,
    status: 'published',
    createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
    views: 0,
    likes: 0,
    repliesCount: 0,
  };
}

export interface MigrationSummary {
  totalFound: number;
  migrated: number;
  skipped: number;
  errors: Array<{ slug: string; error: string }>;
}

/**
 * Executes database migration from Post collection to Thread collection.
 *
 * @param {Object} [options] Migration options.
 * @param {boolean} [options.dryRun=false] If true, runs validation without writing changes.
 * @returns {Promise<MigrationSummary>} Summary of migration counts.
 */
export async function migratePostsToCommunityThreads(
  options: { dryRun?: boolean } = {}
): Promise<MigrationSummary> {
  await dbConnect();

  const posts = await Post.find({ status: { $ne: 'archived' } }).lean();

  const summary: MigrationSummary = {
    totalFound: posts.length,
    migrated: 0,
    skipped: 0,
    errors: [],
  };

  for (const post of posts) {
    try {
      const existingThread = await Thread.findOne({ slug: post.slug });
      if (existingThread) {
        summary.skipped++;
        // If thread already exists, make sure post is marked archived
        if (!options.dryRun && post.status !== 'archived') {
          await Post.updateOne({ _id: post._id }, { status: 'archived' });
        }
        continue;
      }

      const threadData = transformPostToThreadPayload(post as unknown as IPost);

      if (!options.dryRun) {
        await Thread.create(threadData);
        await Post.updateOne({ _id: post._id }, { status: 'archived' });
      }

      summary.migrated++;
    } catch (err: any) {
      summary.errors.push({
        slug: post.slug,
        error: err.message || 'Unknown migration error',
      });
    }
  }

  return summary;
}
