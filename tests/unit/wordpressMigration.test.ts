/**
 * Unit Test Suite for WordPress Migration Transformer Service.
 *
 * @usecase Validates that raw WordPress REST API post payloads are correctly transformed into our domain IPost and ICategory schema interfaces.
 * @dependencies transformWordPressPost, extractPlainTextExcerpt, rewriteInlineImageUrls from src/services/wordpressMigration.
 */
import {
  transformWordPressPost,
  extractPlainTextExcerpt,
  rewriteInlineImageUrls,
} from '../../src/services/wordpressMigration';

describe('WordPress Migration Service (TDD Unit Tests)', () => {
  const mockWpPost = {
    id: 101,
    date: '2026-08-15T10:00:00',
    slug: 'understanding-fasting-blood-sugar',
    title: { rendered: 'Understanding Fasting Blood Sugar' },
    content: {
      rendered:
        '<p>Fasting blood sugar is a vital daily metric for diabetes management.</p><img src="https://diabetescareph.wordpress.com/wp-content/uploads/2026/08/chart.jpg" alt="Chart" />',
    },
    excerpt: { rendered: '<p>Learn why fasting blood sugar matters for diabetes prevention.&hellip;</p>' },
    jetpack_featured_media_url: 'https://diabetescareph.wordpress.com/wp-content/uploads/2026/08/glucose.jpg',
    tags: ['glucose', 'prevention', 'health'],
  };

  it('should strip HTML tags from rendered WordPress excerpts', () => {
    const rawExcerpt = '<p>Learn why <strong>fasting blood sugar</strong> matters!&hellip;</p>';
    const cleanExcerpt = extractPlainTextExcerpt(rawExcerpt);
    expect(cleanExcerpt).toBe('Learn why fasting blood sugar matters!');
  });

  it('should correctly transform raw WP post payload into domain Post entity format', () => {
    const categoryMap = new Map<string, string>([['Health', 'cat_health_123']]);

    const transformed = transformWordPressPost(mockWpPost, ['Health'], categoryMap);

    expect(transformed.title).toBe('Understanding Fasting Blood Sugar');
    expect(transformed.slug).toBe('understanding-fasting-blood-sugar');
    expect(transformed.excerpt).toBe('Learn why fasting blood sugar matters for diabetes prevention.');
    expect(transformed.status).toBe('published');
    expect(transformed.tags).toEqual(['glucose', 'prevention', 'health']);
    expect(transformed.category).toBe('cat_health_123');
    expect(transformed.publishedAt?.toISOString()).toBe('2026-08-15T10:00:00.000Z');
  });

  it('should rewrite inline WordPress image URLs to local upload paths', () => {
    const rawContent =
      '<p>Check chart:</p><img src="https://diabetescareph.wordpress.com/wp-content/uploads/2026/08/chart.jpg" />';
    const mediaMap = new Map<string, string>([
      [
        'https://diabetescareph.wordpress.com/wp-content/uploads/2026/08/chart.jpg',
        '/uploads/wp-media/chart.jpg',
      ],
    ]);

    const rewritten = rewriteInlineImageUrls(rawContent, mediaMap);
    expect(rewritten).toContain('/uploads/wp-media/chart.jpg');
    expect(rewritten).not.toContain('https://diabetescareph.wordpress.com');
  });

  it('should generate fallback excerpt from content if excerpt is missing', () => {
    const postWithoutExcerpt = {
      ...mockWpPost,
      excerpt: { rendered: '' },
    };

    const transformed = transformWordPressPost(postWithoutExcerpt, [], new Map());
    expect(transformed.excerpt).toBe('Fasting blood sugar is a vital daily metric for diabetes management.');
  });
});
