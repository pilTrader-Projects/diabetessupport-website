import mongoose from 'mongoose';
import { dbConnect } from '../lib/dbConnect';
import { PostModel } from '../models/Post';
import { ThreadModel } from '../models/Thread';
import { IThread } from '../types/community';
import { IPost } from '../types/blog';

/**
 * Standard attribution metadata for posts authored by the platform Founder.
 */
export const FOUNDER_ATTRIBUTION = {
  alias: 'Founder & Advocate',
  tag: '#FOUNDER',
  id: 'usr_founder_001',
} as const;

/**
 * Maps legacy blog post category, title, or slug into one of the four active Community forum categories.
 *
 * @usecase Translates disparate WordPress and legacy blog taxonomies into structured forum discussion boards.
 * @param {string} category The legacy category name or ID string.
 * @param {string} title The post title string used for contextual keyword inference.
 * @param {string} slug The post URL slug used for fallback keyword inference.
 * @dependencies None. Pure keyword classification logic.
 * @returns {string} One of: 'Low-GI Pinoy Meals', 'Daily Sugar Tracking', 'Medications & Doctor Visits', or 'General Support'.
 */
export function mapPostCategoryToCommunity(category: string, title: string, slug: string): string {
  const combined = `${category || ''} ${title || ''} ${slug || ''}`.toLowerCase();

  if (
    combined.includes('food') ||
    combined.includes('meal') ||
    combined.includes('recipe') ||
    combined.includes('diet') ||
    combined.includes('low-gi') ||
    combined.includes('ulam')
  ) {
    return 'Low-GI Pinoy Meals';
  }

  if (
    combined.includes('insulin') ||
    combined.includes('sugar') ||
    combined.includes('glucose') ||
    combined.includes('tracking') ||
    combined.includes('hba1c') ||
    combined.includes('biomarker') ||
    combined.includes('how-diabetes-really-starts')
  ) {
    return 'Daily Sugar Tracking';
  }

  if (
    combined.includes('doctor') ||
    combined.includes('medication') ||
    combined.includes('metformin') ||
    combined.includes('prescription') ||
    combined.includes('clinic') ||
    combined.includes('lab')
  ) {
    return 'Medications & Doctor Visits';
  }

  return 'General Support';
}

/**
 * Sanitizes legacy HTML content into clean conversational markdown and appends a community discussion prompt.
 *
 * @usecase Converts rich HTML blog entries into forum-friendly markdown text with a call to action for peer engagement.
 * @param {string} htmlContent Raw HTML content from WordPress post body.
 * @param {string} title Post title used for context.
 * @dependencies None. Regular expression HTML entity decoders and tag transformers.
 * @returns {string} Clean conversational markdown ending with a discussion prompt.
 */
export function cleanHtmlToDiscussionContent(htmlContent: string, title: string): string {
  let text = htmlContent || '';

  // Decode common HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, '“')
    .replace(/&#8221;/g, '”')
    .replace(/&#8216;/g, '‘')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—');

  // Convert headings to markdown
  text = text.replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, '\n\n### $1\n\n');

  // Convert paragraphs to line breaks
  text = text.replace(/<p[^>]*>(.*?)<\/p>/gi, '\n\n$1\n\n');

  // Convert list items
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '\n- $1');

  // Strip remaining HTML tags
  text = text.replace(/<[^>]*>?/gm, '');

  // Compress consecutive blank lines
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  // Discussion prompt inviting peer experiences
  const prompt = `\n\n---\n\n### 💬 Community Discussion & Peer Experiences\n*What has your personal experience been with this? Have you noticed similar signs or found practical routines that worked for you and your family? Share your questions and thoughts below.*`;

  return `${text}${prompt}`;
}

/**
 * Transforms an IPost domain document into an IThread entity.
 *
 * @usecase Maps imported WordPress post fields to Community Thread schema with Founder attribution and clean slugs.
 * @param {Partial<IPost> & { _id?: string | mongoose.Types.ObjectId }} post Source post document.
 * @dependencies mapPostCategoryToCommunity, cleanHtmlToDiscussionContent, FOUNDER_ATTRIBUTION.
 * @returns {Partial<IThread>} Mapped discussion thread object.
 */
export function transformPostToThread(
  post: Partial<IPost> & { _id?: string | mongoose.Types.ObjectId }
): Partial<IThread> {
  const cleanTitle = (post.title || '').replace(/&nbsp;/g, ' ').trim();
  const cleanSlug = decodeURIComponent(post.slug || '')
    .replace(/^[^a-zA-Z0-9]+/, '')
    .trim() || post.slug || 'community-topic';

  const category = mapPostCategoryToCommunity(
    post.category || '',
    post.title || '',
    post.slug || ''
  );

  const content = cleanHtmlToDiscussionContent(post.content || post.excerpt || '', cleanTitle);

  return {
    title: cleanTitle,
    slug: post.slug || cleanSlug,
    content,
    category,
    authorAlias: FOUNDER_ATTRIBUTION.alias,
    authorTag: FOUNDER_ATTRIBUTION.tag,
    authorId: FOUNDER_ATTRIBUTION.id,
    status: 'published',
    likes: 0,
    views: 0,
    repliesCount: 0,
    pinned: false,
    createdAt: post.publishedAt || post.createdAt || new Date(),
  };
}

export interface MigrationResult {
  totalProcessed: number;
  migratedCount: number;
  skippedCount: number;
  archivedPostsCount: number;
  errors: string[];
}

/**
 * Executes idempotent migration of all published Post documents into Thread discussion documents.
 *
 * @usecase Migrates blog articles into the community forum and archives source posts to avoid duplication.
 * @param {{ dryRun?: boolean }} options Execution options (dryRun simulates migration without DB mutation).
 * @dependencies dbConnect, PostModel, ThreadModel, transformPostToThread.
 * @returns {Promise<MigrationResult>} Summary of processed, migrated, skipped, and archived records.
 * @throws {Error} Throws if database connection fails.
 */
export async function migratePostsToThreads(
  options: { dryRun?: boolean } = {}
): Promise<MigrationResult> {
  await dbConnect();

  const posts = await PostModel.find({ status: 'published' }).sort({ publishedAt: 1 }).lean();
  const result: MigrationResult = {
    totalProcessed: posts.length,
    migratedCount: 0,
    skippedCount: 0,
    archivedPostsCount: 0,
    errors: [],
  };

  for (const post of posts) {
    try {
      const existingThread = await ThreadModel.findOne({ slug: post.slug });
      if (existingThread) {
        result.skippedCount++;
        // Even if thread already exists, make sure the Post status is archived if not dry run
        if (!options.dryRun) {
          await PostModel.updateOne({ _id: post._id }, { $set: { status: 'archived' } });
          result.archivedPostsCount++;
        }
        continue;
      }

      const threadData = transformPostToThread(post);

      if (!options.dryRun) {
        await ThreadModel.create(threadData);
        await PostModel.updateOne({ _id: post._id }, { $set: { status: 'archived' } });
        result.archivedPostsCount++;
      }

      result.migratedCount++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`Failed to migrate post "${post.slug}": ${message}`);
    }
  }

  return result;
}
