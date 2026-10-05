import { dbConnect } from '../lib/dbConnect';
import { PostModel } from '../models/Post';
import { ThreadModel } from '../models/Thread';
import { IThread } from '../types/community';
import { IPost } from '../types/blog';

export const FOUNDER_ATTRIBUTION = {
  alias: 'Founder & Advocate',
  tag: '#FOUNDER',
  id: 'usr_founder_001',
};

/**
 * Maps legacy post category, title, or slug into one of the four active Community forum categories.
 */
export function mapPostCategoryToCommunity(category: string, title: string, slug: string): string {
  const combined = `${category} ${title} ${slug}`.toLowerCase();

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
 * Sanitizes legacy HTML content into clean conversational markdown/text and appends a community discussion prompt.
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

  // Discussion prompt
  const prompt = `\n\n---\n\n### 💬 Community Discussion & Peer Experiences\n*What has your personal experience been with this? Have you noticed similar signs or found practical routines that worked for you and your family? Share your questions and thoughts below.*`;

  return `${text}${prompt}`;
}

/**
 * Transforms an IPost domain document into an IThread entity.
 */
export function transformPostToThread(post: Partial<IPost> & { _id?: any }): Partial<IThread> {
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
 * Executes migration of all published Post documents into Thread discussion documents.
 */
export async function migratePostsToThreads(options: { dryRun?: boolean } = {}): Promise<MigrationResult> {
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
    } catch (err: any) {
      result.errors.push(`Failed to migrate post "${post.slug}": ${err.message}`);
    }
  }

  return result;
}
