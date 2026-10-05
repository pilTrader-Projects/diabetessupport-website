import {
  syncPostToCommunityThread,
  removeCommunityThreadBySlug,
} from '../../src/services/communityArticleSyncService';
import { ThreadModel } from '../../src/models/Thread';
import { FOUNDER_ATTRIBUTION } from '../../src/services/postToThreadMigration';

jest.mock('../../src/models/Thread', () => ({
  ThreadModel: {
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

describe('communityArticleSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncPostToCommunityThread', () => {
    it('should upsert a community thread with Founder attribution when article is published', async () => {
      const mockPost = {
        title: 'Top 10 High Fiber Pinoy Foods',
        slug: 'top-10-high-fiber-pinoy-foods',
        content: '<p>High fiber foods slow digestion.</p><h3>1. Kangkong</h3><p>Affordable green.</p>',
        category: 'Nutrition & Meals',
        status: 'published' as const,
      };

      const mockThread = {
        _id: 'thread_123',
        slug: 'top-10-high-fiber-pinoy-foods',
        title: 'Top 10 High Fiber Pinoy Foods',
        authorAlias: FOUNDER_ATTRIBUTION.alias,
        authorTag: FOUNDER_ATTRIBUTION.tag,
        status: 'published',
      };

      (ThreadModel.findOneAndUpdate as jest.Mock).mockResolvedValue(mockThread);

      const result = await syncPostToCommunityThread(mockPost);

      expect(ThreadModel.findOneAndUpdate).toHaveBeenCalledWith(
        { slug: 'top-10-high-fiber-pinoy-foods' },
        expect.objectContaining({
          $set: expect.objectContaining({
            title: 'Top 10 High Fiber Pinoy Foods',
            authorAlias: FOUNDER_ATTRIBUTION.alias,
            authorTag: FOUNDER_ATTRIBUTION.tag,
            status: 'published',
            category: 'Low-GI Pinoy Meals',
          }),
        }),
        { upsert: true, returnDocument: 'after' }
      );
      expect(result).toEqual(mockThread);
    });

    it('should archive existing community thread when article status is draft or archived', async () => {
      const mockPost = {
        title: 'Draft Post',
        slug: 'draft-post',
        content: '<p>Draft</p>',
        status: 'draft' as const,
      };

      (ThreadModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      const result = await syncPostToCommunityThread(mockPost);

      expect(ThreadModel.updateOne).toHaveBeenCalledWith(
        { slug: 'draft-post' },
        { $set: { status: 'archived' } }
      );
      expect(result).toBeNull();
    });
  });

  describe('removeCommunityThreadBySlug', () => {
    it('should delete the community thread when article is deleted', async () => {
      (ThreadModel.deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const result = await removeCommunityThreadBySlug('old-article-slug');

      expect(ThreadModel.deleteOne).toHaveBeenCalledWith({ slug: 'old-article-slug' });
      expect(result).toBe(true);
    });
  });
});
