import {
  mapPostCategoryToCommunity,
  cleanHtmlToDiscussionContent,
  transformPostToThread,
  migratePostsToThreads,
  FOUNDER_ATTRIBUTION,
} from '@/services/postToThreadMigration';
import { IPost } from '@/types/blog';
import { PostModel } from '@/models/Post';
import { ThreadModel } from '@/models/Thread';

jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models/Post', () => ({
  PostModel: {
    find: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock('@/models/Thread', () => ({
  ThreadModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

describe('Legacy Post to Community Thread Migration (BE Service)', () => {
  const mockPost: Partial<IPost> = {
    title: 'Top 10 Filipino Foods for Managing Diabetes (With a Free Meal&nbsp;Plan)',
    slug: 'top-10-filipino-foods-for-managing-diabetes-with-a-free-meal-plan',
    content: '<h3>Delicious Low-GI Options</h3><p>Eating healthy does not mean giving up Filipino staples.</p>',
    excerpt: 'Top 10 Filipino Foods for Managing Diabetes with meal plan guide.',
    category: 'Nutrition & Diet',
    status: 'published',
    publishedAt: new Date('2025-10-03T15:54:09.000Z'),
    createdAt: new Date('2025-10-03T15:54:09.000Z'),
  };

  describe('mapPostCategoryToCommunity', () => {
    it('maps food and meal-related posts to Low-GI Pinoy Meals category (Happy Path)', () => {
      const category = mapPostCategoryToCommunity(
        mockPost.category || '',
        mockPost.title || '',
        mockPost.slug || ''
      );
      expect(category).toBe('Low-GI Pinoy Meals');
    });

    it('maps insulin, glucose, and tracking posts to Daily Sugar Tracking category (Happy Path)', () => {
      const category = mapPostCategoryToCommunity(
        'Blood Sugar',
        'What Is Insulin Resistance? Understanding How Cells Stop Responding',
        'understanding-insulin-resistance-diabetes'
      );
      expect(category).toBe('Daily Sugar Tracking');
    });

    it('maps medication-related posts to Medications & Doctor Visits category (Happy Path)', () => {
      const category = mapPostCategoryToCommunity(
        'Medications',
        'Metformin and Doctor Consultation Checklist',
        'metformin-checklist'
      );
      expect(category).toBe('Medications & Doctor Visits');
    });

    it('defaults unmapped or empty inputs to General Support category (Edge Case)', () => {
      expect(mapPostCategoryToCommunity('', '', '')).toBe('General Support');
      expect(mapPostCategoryToCommunity(null as any, undefined as any, '')).toBe('General Support');
    });
  });

  describe('cleanHtmlToDiscussionContent', () => {
    it('converts HTML headings, paragraphs, and entities to conversational text (Happy Path)', () => {
      const content = cleanHtmlToDiscussionContent(mockPost.content || '', mockPost.title || '');
      expect(content).not.toContain('<h3>');
      expect(content).not.toContain('<p>');
      expect(content).toContain('Delicious Low-GI Options');
      expect(content).toContain('Community Discussion');
      expect(content).toContain('What has your personal experience been');
    });

    it('handles empty or null HTML content gracefully (Edge Case)', () => {
      const emptyContent = cleanHtmlToDiscussionContent('', 'Untitled');
      expect(emptyContent).toContain('Community Discussion');
      expect(emptyContent).toContain('Share your questions and thoughts below.');
    });
  });

  describe('transformPostToThread', () => {
    it('transforms a legacy blog post into a thread entity with #FOUNDER attribution (Happy Path)', () => {
      const threadData = transformPostToThread(mockPost);
      expect(threadData.authorAlias).toBe(FOUNDER_ATTRIBUTION.alias);
      expect(threadData.authorTag).toBe(FOUNDER_ATTRIBUTION.tag);
      expect(threadData.authorId).toBe(FOUNDER_ATTRIBUTION.id);
      expect(threadData.title).toBe('Top 10 Filipino Foods for Managing Diabetes (With a Free Meal Plan)');
      expect(threadData.slug).toBe(mockPost.slug);
      expect(threadData.category).toBe('Low-GI Pinoy Meals');
      expect(threadData.status).toBe('published');
      expect(threadData.createdAt).toEqual(mockPost.publishedAt);
    });

    it('cleans URL-encoded slugs and defaults missing dates (Edge Case)', () => {
      const encodedPost: Partial<IPost> = {
        title: 'Silent Signs',
        slug: '%f0%9f%a9%b8silent-signs',
      };
      const threadData = transformPostToThread(encodedPost);
      expect(threadData.title).toBe('Silent Signs');
      expect(threadData.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('migratePostsToThreads (Idempotency & Error Handling)', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('migrates new posts and archives source documents (Happy Path)', async () => {
      (PostModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockPost]),
        }),
      });
      (ThreadModel.findOne as jest.Mock).mockResolvedValue(null);
      (ThreadModel.create as jest.Mock).mockResolvedValue({ _id: 'thread_new_1' });
      (PostModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      const result = await migratePostsToThreads({ dryRun: false });

      expect(result.totalProcessed).toBe(1);
      expect(result.migratedCount).toBe(1);
      expect(result.skippedCount).toBe(0);
      expect(result.archivedPostsCount).toBe(1);
      expect(ThreadModel.create).toHaveBeenCalledTimes(1);
      expect(PostModel.updateOne).toHaveBeenCalledTimes(1);
    });

    it('skips existing threads and archives source post without duplicate thread creation (Edge Case)', async () => {
      (PostModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockPost]),
        }),
      });
      (ThreadModel.findOne as jest.Mock).mockResolvedValue({ _id: 'existing_thread' });
      (PostModel.updateOne as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

      const result = await migratePostsToThreads({ dryRun: false });

      expect(result.totalProcessed).toBe(1);
      expect(result.migratedCount).toBe(0);
      expect(result.skippedCount).toBe(1);
      expect(result.archivedPostsCount).toBe(1);
      expect(ThreadModel.create).not.toHaveBeenCalled();
    });

    it('simulates migration without mutating database in dry-run mode (Edge Case)', async () => {
      (PostModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockPost]),
        }),
      });
      (ThreadModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await migratePostsToThreads({ dryRun: true });

      expect(result.totalProcessed).toBe(1);
      expect(result.migratedCount).toBe(1);
      expect(result.archivedPostsCount).toBe(0);
      expect(ThreadModel.create).not.toHaveBeenCalled();
      expect(PostModel.updateOne).not.toHaveBeenCalled();
    });

    it('catches and records errors gracefully without crashing the process (Sad Path)', async () => {
      (PostModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([mockPost]),
        }),
      });
      (ThreadModel.findOne as jest.Mock).mockRejectedValue(new Error('Database timeout'));

      const result = await migratePostsToThreads({ dryRun: false });

      expect(result.totalProcessed).toBe(1);
      expect(result.errors.length).toBe(1);
      expect(result.errors[0]).toContain('Database timeout');
    });
  });
});
