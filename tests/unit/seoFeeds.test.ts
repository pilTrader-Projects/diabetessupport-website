/**
 * Integration & Unit Test Suite for Dynamic SEO Sitemap & RSS Feed Endpoints.
 *
 * @usecase Validates that /sitemap.xml and /feed.xml generate compliant XML feeds for search engines and RSS aggregators.
 * @dependencies GET handlers from src/app/sitemap.xml/route.ts and src/app/feed.xml/route.ts.
 */
import { GET as getSitemap } from '../../src/app/sitemap.xml/route';
import { GET as getRssFeed } from '../../src/app/feed.xml/route';
import { PostModel } from '../../src/models/Post';
import { Thread } from '../../src/models/Thread';
import { SITE_CONFIG } from '../../src/config/constants';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Post', () => ({
  PostModel: {
    find: jest.fn(),
  },
}));

jest.mock('../../src/models/Thread', () => ({
  Thread: {
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
    it('should generate valid XML sitemap containing static, post, and thread URLs', async () => {
      const mockPostQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockPosts),
      };
      (PostModel.find as jest.Mock).mockReturnValue(mockPostQuery);

      const mockThreadQuery = {
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          {
            slug: 'fasting-glucose-tips',
            updatedAt: new Date('2026-09-04T10:00:00Z'),
          },
        ]),
      };
      (Thread.find as jest.Mock).mockReturnValue(mockThreadQuery);

      const response = await getSitemap();
      const xmlText = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('xml');
      expect(xmlText).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xmlText).toContain('<urlset');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/ph</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/learn</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/community</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/glycosense</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/guides/cheatsheet</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/privacy-policy</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/terms-of-service</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/about</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/contact</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/learn/understanding-insulin-resistance-early</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/learn/warning-signs-of-high-blood-sugar</loc>');
      expect(xmlText).toContain('<loc>https://www.beforethenumbers.org/community/fasting-glucose-tips</loc>');
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
      expect(xmlText).toContain('<title>Before the Numbers - Don&apos;t Wait for the Diagnosis</title>');
      expect(xmlText).toContain('<title>Understanding Insulin Resistance Early</title>');
      expect(xmlText).toContain(`<link>https://${SITE_CONFIG.domain}/learn/understanding-insulin-resistance-early</link>`);
    });
  });
});
