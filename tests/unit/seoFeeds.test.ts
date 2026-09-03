/**
 * Integration & Unit Test Suite for Dynamic SEO Sitemap & RSS Feed Endpoints.
 *
 * @usecase Validates that /sitemap.xml and /feed.xml generate compliant XML feeds for search engines and RSS aggregators.
 * @dependencies GET handlers from src/app/sitemap.xml/route.ts and src/app/feed.xml/route.ts.
 */
import { GET as getSitemap } from '../../src/app/sitemap.xml/route';
import { GET as getRssFeed } from '../../src/app/feed.xml/route';
import { PostModel } from '../../src/models/Post';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Post', () => ({
  PostModel: {
    find: jest.fn(),
  },
}));

describe('SEO Dynamic XML Sitemap & RSS Feed Generators', () => {
  const mockPosts = [
    {
      _id: '1',
      title: 'Understanding Insulin Resistance Early',
      slug: 'understanding-insulin-resistance-early',
      excerpt: 'Comprehensive guide to insulin resistance',
      content: '<p>Insulin resistance content...</p>',
      category: 'Education',
      publishedAt: new Date('2026-09-01T10:00:00Z'),
      updatedAt: new Date('2026-09-01T10:00:00Z'),
      status: 'published',
    },
    {
      _id: '2',
      title: 'Warning Signs of High Blood Sugar',
      slug: 'warning-signs-of-high-blood-sugar',
      excerpt: 'Learn the silent warning signs',
      content: '<p>High blood sugar signs...</p>',
      category: 'Awareness',
      publishedAt: new Date('2026-09-02T10:00:00Z'),
      updatedAt: new Date('2026-09-02T10:00:00Z'),
      status: 'published',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /sitemap.xml', () => {
    it('should generate valid XML sitemap containing static and post URLs', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      (PostModel.find as jest.Mock).mockReturnValue(mockQuery);

      const response = await getSitemap();
      const xmlText = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('xml');
      expect(xmlText).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xmlText).toContain('<urlset');
      expect(xmlText).toContain('<loc>https://diabetescareph.com/</loc>');
      expect(xmlText).toContain('<loc>https://diabetescareph.com/blog</loc>');
      expect(xmlText).toContain('<loc>https://diabetescareph.com/blog/understanding-insulin-resistance-early</loc>');
      expect(xmlText).toContain('<loc>https://diabetescareph.com/blog/warning-signs-of-high-blood-sugar</loc>');
    });
  });

  describe('GET /feed.xml', () => {
    it('should generate valid RSS 2.0 XML feed with channel and items', async () => {
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      (PostModel.find as jest.Mock).mockReturnValue(mockQuery);

      const response = await getRssFeed();
      const xmlText = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('xml');
      expect(xmlText).toContain('<rss version="2.0"');
      expect(xmlText).toContain('<title>DiabetesCare PH - Educational &amp; Awareness Campaign for Diabetes Care</title>');
      expect(xmlText).toContain('<title>Understanding Insulin Resistance Early</title>');
      expect(xmlText).toContain('<link>https://diabetescareph.com/blog/understanding-insulin-resistance-early</link>');
    });
  });
});
