import {
  mapPostCategoryToCommunity,
  cleanHtmlToDiscussionContent,
  transformPostToThread,
  FOUNDER_ATTRIBUTION,
} from '@/services/postToThreadMigration';
import { IPost } from '@/types/blog';

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

  it('should map food and meal-related posts to Low-GI Pinoy Meals category', () => {
    const category = mapPostCategoryToCommunity(
      mockPost.category || '',
      mockPost.title || '',
      mockPost.slug || ''
    );
    expect(category).toBe('Low-GI Pinoy Meals');
  });

  it('should map insulin, glucose, and tracking posts to Daily Sugar Tracking category', () => {
    const category = mapPostCategoryToCommunity(
      'Blood Sugar',
      'What Is Insulin Resistance? Understanding How Cells Stop Responding',
      'understanding-insulin-resistance-diabetes'
    );
    expect(category).toBe('Daily Sugar Tracking');
  });

  it('should map medication-related posts to Medications & Doctor Visits category', () => {
    const category = mapPostCategoryToCommunity(
      'Medications',
      'Metformin and Doctor Consultation Checklist',
      'metformin-checklist'
    );
    expect(category).toBe('Medications & Doctor Visits');
  });

  it('should default other posts to General Support category', () => {
    const category = mapPostCategoryToCommunity(
      'Uncategorized',
      'My Personal Reflection on Staying Motivated',
      'personal-reflection'
    );
    expect(category).toBe('General Support');
  });

  it('should convert HTML to clean conversational text and append a community prompt', () => {
    const content = cleanHtmlToDiscussionContent(mockPost.content || '', mockPost.title || '');
    expect(content).not.toContain('<h3>');
    expect(content).not.toContain('<p>');
    expect(content).toContain('Delicious Low-GI Options');
    expect(content).toContain('Community Discussion');
    expect(content).toContain('What has your personal experience been');
  });

  it('should transform a legacy blog post into a thread entity with #FOUNDER attribution', () => {
    const threadData = transformPostToThread(mockPost as any);
    expect(threadData.authorAlias).toBe(FOUNDER_ATTRIBUTION.alias);
    expect(threadData.authorTag).toBe(FOUNDER_ATTRIBUTION.tag);
    expect(threadData.authorId).toBe(FOUNDER_ATTRIBUTION.id);
    expect(threadData.title).toBe('Top 10 Filipino Foods for Managing Diabetes (With a Free Meal Plan)');
    expect(threadData.slug).toBe(mockPost.slug);
    expect(threadData.category).toBe('Low-GI Pinoy Meals');
    expect(threadData.status).toBe('published');
    expect(threadData.createdAt).toEqual(mockPost.publishedAt);
  });
});
