/**
 * Unit Test Suite for SEO Structured Data (JSON-LD), Robots.txt, and AdSense ads.txt Endpoints.
 *
 * @usecase Validates JSON-LD schema generation, robots.txt crawler directives, and ads.txt seller records.
 * @dependencies src/lib/schema.ts, src/app/robots.ts, src/app/ads.txt/route.ts.
 */
import {
  buildOrganizationSchema,
  buildWebSiteSchema,
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildSoftwareAppSchema,
} from '../../src/lib/schema';
import robots from '../../src/app/robots';
import { GET as getAdsTxt } from '../../src/app/ads.txt/route';
import { SITE_CONFIG } from '../../src/config/constants';

describe('SEO & AdSense Compliance Architecture', () => {
  describe('JSON-LD Schema Generators (src/lib/schema.ts)', () => {
    it('should generate valid MedicalOrganization Schema', () => {
      const orgSchema = buildOrganizationSchema();
      expect(orgSchema['@context']).toBe('https://schema.org');
      expect(orgSchema['@type']).toBe('MedicalOrganization');
      expect(orgSchema.name).toBe('DiabetesCare PH');
      expect(orgSchema.url).toContain(SITE_CONFIG.domain);
      expect(orgSchema.knowsAbout).toBeInstanceOf(Array);
      expect(orgSchema.knowsAbout.length).toBeGreaterThan(0);
    });

    it('should generate valid WebSite Schema with SearchAction', () => {
      const webSiteSchema = buildWebSiteSchema();
      expect(webSiteSchema['@context']).toBe('https://schema.org');
      expect(webSiteSchema['@type']).toBe('WebSite');
      expect(webSiteSchema.name).toBe('DiabetesCare PH');
      expect(webSiteSchema.potentialAction['@type']).toBe('SearchAction');
      expect(webSiteSchema.potentialAction.target.urlTemplate).toContain('/blog?search=');
    });

    it('should generate valid Article & MedicalWebPage Schema for blog posts', () => {
      const mockPost: any = {
        title: 'Mastering Blood Glucose Finger Prick Testing',
        excerpt: 'Complete guide to accurate manual testing.',
        metaDescription: 'Manual blood glucose testing guide.',
        featuredImage: 'https://diabetescareph.com/uploads/glucose-test.jpg',
        publishedAt: new Date('2026-09-01T00:00:00Z'),
        updatedAt: new Date('2026-09-02T00:00:00Z'),
      };

      const articleSchema = buildArticleSchema(mockPost, 'mastering-blood-glucose');
      expect(articleSchema['@context']).toBe('https://schema.org');
      expect(articleSchema['@type']).toContain('BlogPosting');
      expect(articleSchema['@type']).toContain('MedicalWebPage');
      expect(articleSchema.headline).toBe(mockPost.title);
      expect(articleSchema.description).toBe(mockPost.excerpt);
      expect(articleSchema.mainEntityOfPage['@id']).toContain('/blog/mastering-blood-glucose');
      expect(articleSchema.about['@type']).toBe('MedicalCondition');
    });

    it('should generate valid BreadcrumbList Schema', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://diabetescareph.com/' },
        { name: 'Articles', url: 'https://diabetescareph.com/blog' },
        { name: 'HbA1c Guide', url: 'https://diabetescareph.com/blog/hba1c-guide' },
      ];

      const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);
      expect(breadcrumbSchema['@context']).toBe('https://schema.org');
      expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');
      expect(breadcrumbSchema.itemListElement).toHaveLength(3);
      expect(breadcrumbSchema.itemListElement[0].position).toBe(1);
      expect(breadcrumbSchema.itemListElement[0].name).toBe('Home');
      expect(breadcrumbSchema.itemListElement[2].name).toBe('HbA1c Guide');
    });

    it('should generate valid SoftwareApplication Schema for GlycoSense PWA', () => {
      const appSchema = buildSoftwareAppSchema();
      expect(appSchema['@context']).toBe('https://schema.org');
      expect(appSchema['@type']).toBe('SoftwareApplication');
      expect(appSchema.name).toBe('GlycoSense');
      expect(appSchema.applicationCategory).toBe('HealthApplication');
      expect(appSchema.offers.price).toBe('0.00');
    });
  });

  describe('Robots.txt Generator (src/app/robots.ts)', () => {
    it('should declare disallow rules for sensitive directories and point to sitemap', () => {
      const robotsConfig = robots();
      expect(robotsConfig.rules).toBeDefined();

      const defaultRule = (robotsConfig.rules as any[]).find((r) => r.userAgent === '*');
      expect(defaultRule).toBeDefined();
      expect(defaultRule.allow).toBe('/');
      expect(defaultRule.disallow).toContain('/api/');
      expect(defaultRule.disallow).toContain('/admin/');

      expect(robotsConfig.sitemap).toContain('/sitemap.xml');
    });
  });

  describe('AdSense Authorized Digital Sellers (GET /ads.txt)', () => {
    it('should return 200 plain text containing publisher id seller record', async () => {
      const response = await getAdsTxt();
      const text = await response.text();

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');
      expect(text).toContain('google.com');
      expect(text).toContain('DIRECT');
      expect(text).toContain('f08c47fec0942fa0');
    });
  });
});
