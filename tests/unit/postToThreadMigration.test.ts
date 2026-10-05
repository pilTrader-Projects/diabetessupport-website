import {
  mapPostCategoryToCommunityCategory,
  transformPostToThreadPayload,
  COMMUNITY_DISCUSSION_PROMPT,
} from '@/services/postToThreadMigration';
import { IPost } from '@/types/blog';

jest.mock('@/lib/dbConnect', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(true),
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Post to Thread Migration Service', () => {
  const samplePost: Partial<IPost> = {
    title: 'How I Managed Blood Sugar Spikes After Rice Meals',
    slug: 'rice-meals-blood-sugar-spikes',
    content: '<p>For many years, eating white rice caused sudden glucose surges. Here is what I observed.</p>',
    excerpt: 'Observations on glucose spikes after white rice.',
    category: 'Nutrition & Diet',
    status: 'published',
    createdAt: new Date('2025-06-15T10:00:00.000Z'),
  };

  describe('mapPostCategoryToCommunityCategory', () => {
    it('should map food/diet/recipe categories to Low-GI Pinoy Meals', () => {
      expect(mapPostCategoryToCommunityCategory('Nutrition & Diet')).toBe('Low-GI Pinoy Meals');
      expect(mapPostCategoryToCommunityCategory('Healthy Recipes')).toBe('Low-GI Pinoy Meals');
      expect(mapPostCategoryToCommunityCategory('Pinoy Food')).toBe('Low-GI Pinoy Meals');
    });

    it('should map glucose/tracking/sugar categories to Daily Sugar Tracking', () => {
      expect(mapPostCategoryToCommunityCategory('Fasting Sugar')).toBe('Daily Sugar Tracking');
      expect(mapPostCategoryToCommunityCategory('Glucose Monitoring')).toBe('Daily Sugar Tracking');
    });

    it('should map medication/doctor categories to Medications & Doctor Visits', () => {
      expect(mapPostCategoryToCommunityCategory('Doctor Consultation')).toBe('Medications & Doctor Visits');
      expect(mapPostCategoryToCommunityCategory('Metformin & Medications')).toBe('Medications & Doctor Visits');
    });

    it('should fallback to General Support for unmapped categories', () => {
      expect(mapPostCategoryToCommunityCategory('Uncategorized')).toBe('General Support');
      expect(mapPostCategoryToCommunityCategory('')).toBe('General Support');
    });
  });

  describe('transformPostToThreadPayload', () => {
    it('should transform a post into a valid community thread payload with Founder authorship', () => {
      const threadPayload = transformPostToThreadPayload(samplePost as IPost);

      expect(threadPayload.title).toBe(samplePost.title);
      expect(threadPayload.slug).toBe(samplePost.slug);
      expect(threadPayload.authorAlias).toBe('Founder & Advocate');
      expect(threadPayload.authorTag).toBe('#FOUNDER');
      expect(threadPayload.authorId).toBe('usr_founder_001');
      expect(threadPayload.category).toBe('Low-GI Pinoy Meals');
      expect(threadPayload.status).toBe('published');
      expect(threadPayload.content).toContain('For many years, eating white rice caused sudden glucose surges');
      expect(threadPayload.content).toContain(COMMUNITY_DISCUSSION_PROMPT);
    });

    it('should enforce 200 character limit on thread titles', () => {
      const longTitlePost: Partial<IPost> = {
        ...samplePost,
        title: 'A'.repeat(250),
      };

      const threadPayload = transformPostToThreadPayload(longTitlePost as IPost);
      expect(threadPayload.title.length).toBeLessThanOrEqual(200);
    });

    it('should clean WordPress comments and raw HTML tags from content', () => {
      const wpPost: Partial<IPost> = {
        ...samplePost,
        content: '<!-- wp:paragraph --><p>Hello world &nbsp;</p><!-- /wp:paragraph -->',
      };

      const threadPayload = transformPostToThreadPayload(wpPost as IPost);
      expect(threadPayload.content).not.toContain('<!-- wp:paragraph -->');
      expect(threadPayload.content).toContain('Hello world');
    });
  });

  describe('migratePostsToCommunityThreads execution', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should migrate posts when thread does not exist and update post status to archived', async () => {
      const { Post } = require('@/models/Post');
      const { Thread } = require('@/models/Thread');
      const { migratePostsToCommunityThreads } = require('@/services/postToThreadMigration');

      jest.spyOn(Post, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'post_123',
            title: 'Sample Post',
            slug: 'sample-post',
            content: 'Hello community',
            category: 'Recipes',
            status: 'published',
            createdAt: new Date(),
          },
        ]),
      } as any);

      jest.spyOn(Thread, 'findOne').mockResolvedValue(null as any);
      jest.spyOn(Thread, 'create').mockResolvedValue({} as any);
      jest.spyOn(Post, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as any);

      const summary = await migratePostsToCommunityThreads({ dryRun: false });

      expect(summary.totalFound).toBe(1);
      expect(summary.migrated).toBe(1);
      expect(summary.skipped).toBe(0);
      expect(Thread.create).toHaveBeenCalled();
      expect(Post.updateOne).toHaveBeenCalledWith({ _id: 'post_123' }, { status: 'archived' });
    });

    it('should skip migration if thread with same slug already exists', async () => {
      const { Post } = require('@/models/Post');
      const { Thread } = require('@/models/Thread');
      const { migratePostsToCommunityThreads } = require('@/services/postToThreadMigration');

      jest.spyOn(Post, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          {
            _id: 'post_existing',
            title: 'Existing Post',
            slug: 'existing-post',
            content: 'Already exists',
            status: 'published',
          },
        ]),
      } as any);

      jest.spyOn(Thread, 'findOne').mockResolvedValue({ _id: 'thread_existing' } as any);
      const createSpy = jest.spyOn(Thread, 'create').mockResolvedValue({} as any);
      jest.spyOn(Post, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as any);

      const summary = await migratePostsToCommunityThreads({ dryRun: false });

      expect(summary.totalFound).toBe(1);
      expect(summary.migrated).toBe(0);
      expect(summary.skipped).toBe(1);
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
});

