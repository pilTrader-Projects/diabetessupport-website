import { ThreadModel } from '../models/Thread';
import { IThread } from '../types/community';
import { IPost } from '../types/blog';
import { transformPostToThread } from './postToThreadMigration';

/**
 * Synchronizes an admin-managed Post document to the Community forum Thread collection.
 *
 * @usecase Ensures that any educational article created or updated via the Admin CMS is
 * directly reflected as an official Founder discussion thread (#FOUNDER) in the Community forum.
 * @param {Partial<IPost>} post The source post data from Admin CMS or automated API.
 * @dependencies ThreadModel, transformPostToThread.
 * @returns {Promise<IThread | null>} The synchronized discussion thread or null if archived.
 */
export async function syncPostToCommunityThread(post: Partial<IPost>): Promise<IThread | null> {
  const slug = post.slug?.trim();
  if (!slug) return null;

  if (post.status === 'published') {
    const threadData = transformPostToThread(post);
    const updatedThread = await ThreadModel.findOneAndUpdate(
      { slug },
      { $set: threadData },
      { upsert: true, returnDocument: 'after' }
    );
    return updatedThread as IThread;
  }

  // If article is draft or archived, ensure the community thread is archived
  await ThreadModel.updateOne({ slug }, { $set: { status: 'archived' } });
  return null;
}

/**
 * Removes or cleans up a community discussion thread when an admin deletes the source article.
 *
 * @usecase Maintains parity between the Admin Article CMS and the Community discussion board upon deletion.
 * @param {string} slug The unique URL slug of the post/thread.
 * @dependencies ThreadModel.
 * @returns {Promise<boolean>} True if deletion query succeeded.
 */
export async function removeCommunityThreadBySlug(slug: string): Promise<boolean> {
  if (!slug) return false;
  const result = await ThreadModel.deleteOne({ slug: slug.trim() });
  return (result?.deletedCount ?? 0) > 0;
}
