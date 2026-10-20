import { formatTitle, formatCanonicalUrl, buildMetadata } from '@/lib/seo';
import { metadata as hiddenClockMetadata } from '@/app/hidden-clock/page';
import { metadata as homeMetadata } from '@/app/page';
import { metadata as insulinResetMetadata } from '@/app/insulin-reset/page';
import { metadata as glycosenseMetadata } from '@/app/glycosense/page';
import { metadata as phMetadata } from '@/app/ph/page';
import { metadata as aboutMetadata } from '@/app/about/page';
import { metadata as subscribeMetadata } from '@/app/subscribe/page';
import { metadata as cheatsheetMetadata } from '@/app/guides/cheatsheet/page';
import { metadata as editorialPolicyMetadata } from '@/app/editorial-policy/page';
import { metadata as correctionsMetadata } from '@/app/corrections/page';

describe('SEO Metadata Helper (src/lib/seo.ts) & Canonical Validation (P1-02)', () => {
  describe('formatTitle', () => {
    it('appends site name when missing from raw title', () => {
      const title = formatTitle('The Hidden Metabolic Clock');
      expect(title).toBe('The Hidden Metabolic Clock | Before the Numbers');
      const count = (title.match(/Before the Numbers/g) || []).length;
      expect(count).toBe(1);
    });

    it('preserves title when site name is already present exactly once at the end', () => {
      const title = formatTitle('Privacy Policy | Before the Numbers');
      expect(title).toBe('Privacy Policy | Before the Numbers');
      const count = (title.match(/Before the Numbers/g) || []).length;
      expect(count).toBe(1);
    });

    it('preserves title when site name is already present at the start', () => {
      const title = formatTitle("Before the Numbers | Don't Wait for the Diagnosis");
      expect(title).toBe("Before the Numbers | Don't Wait for the Diagnosis");
      const count = (title.match(/Before the Numbers/g) || []).length;
      expect(count).toBe(1);
    });

    it('eliminates duplicated site names if appended multiple times', () => {
      const title = formatTitle('The Hidden Metabolic Clock | Before the Numbers | Before the Numbers');
      expect(title).toBe('The Hidden Metabolic Clock | Before the Numbers');
      const count = (title.match(/Before the Numbers/g) || []).length;
      expect(count).toBe(1);
    });

    it('handles empty or non-string inputs with default site name', () => {
      expect(formatTitle('')).toBe('Before the Numbers');
      expect(formatTitle(null as unknown as string)).toBe('Before the Numbers');
      expect(formatTitle(undefined as unknown as string)).toBe('Before the Numbers');
    });
  });

  describe('formatCanonicalUrl', () => {
    it('formats root path correctly', () => {
      expect(formatCanonicalUrl('/')).toBe('https://www.beforethenumbers.org');
      expect(formatCanonicalUrl('')).toBe('https://www.beforethenumbers.org');
    });

    it('formats subpaths with leading slash', () => {
      expect(formatCanonicalUrl('/hidden-clock')).toBe('https://www.beforethenumbers.org/hidden-clock');
      expect(formatCanonicalUrl('hidden-clock')).toBe('https://www.beforethenumbers.org/hidden-clock');
    });

    it('removes trailing slashes from subpaths', () => {
      expect(formatCanonicalUrl('/hidden-clock/')).toBe('https://www.beforethenumbers.org/hidden-clock');
    });
  });

  describe('buildMetadata', () => {
    it('constructs consistent Metadata where canonical equals og:url and site name appears once', () => {
      const meta = buildMetadata({
        title: 'The Hidden Metabolic Clock: What May Be Happening Before the Numbers Change',
        description: 'Your body can compensate for metabolic breakdown for years behind normal glucose readings.',
        path: '/hidden-clock',
      });

      const titleStr = typeof meta.title === 'string' ? meta.title : '';
      expect(titleStr).toContain('Before the Numbers');
      expect((titleStr.match(/Before the Numbers/g) || []).length).toBe(1);

      const canonical = meta.alternates?.canonical;
      const ogUrl = meta.openGraph?.url;

      expect(canonical).toBe('https://www.beforethenumbers.org/hidden-clock');
      expect(ogUrl).toBe('https://www.beforethenumbers.org/hidden-clock');
      expect(canonical).toBe(ogUrl);

      expect(meta.description).toContain('compensate for metabolic breakdown');
      expect(meta.openGraph?.title).toBe(titleStr);
      expect(meta.robots).toEqual({ index: true, follow: true });
      expect(meta.twitter).toBeDefined();
    });

    it('supports noIndex flag for unindexed utility routes', () => {
      const meta = buildMetadata({
        title: 'Your Report is on the Way',
        description: 'Next critical step confirmation.',
        path: '/reset-success',
        noIndex: true,
      });

      expect(meta.robots).toEqual({ index: false, follow: false });
    });
  });

  describe('Production Route Audit: 5+ Public Routes Verification', () => {
    const routesToTest = [
      { name: '/hidden-clock', meta: hiddenClockMetadata, expectedPath: '/hidden-clock' },
      { name: '/', meta: homeMetadata, expectedPath: '' },
      { name: '/insulin-reset', meta: insulinResetMetadata, expectedPath: '/insulin-reset' },
      { name: '/glycosense', meta: glycosenseMetadata, expectedPath: '/glycosense' },
      { name: '/ph', meta: phMetadata, expectedPath: '/ph' },
      { name: '/about', meta: aboutMetadata, expectedPath: '/about' },
      { name: '/subscribe', meta: subscribeMetadata, expectedPath: '/subscribe' },
      { name: '/guides/cheatsheet', meta: cheatsheetMetadata, expectedPath: '/guides/cheatsheet' },
      { name: '/editorial-policy', meta: editorialPolicyMetadata, expectedPath: '/editorial-policy' },
      { name: '/corrections', meta: correctionsMetadata, expectedPath: '/corrections' },
    ];

    for (const route of routesToTest) {
      it(`verifies ${route.name} has canonical equal to og:url and site name exactly once in title`, () => {
        const { meta, expectedPath } = route;
        const titleStr = typeof meta.title === 'string' ? meta.title : '';

        // 1. Title verification: Site name occurs exactly once
        expect(titleStr).toContain('Before the Numbers');
        const siteCount = (titleStr.match(/Before the Numbers/g) || []).length;
        expect(siteCount).toBe(1);

        // 2. Canonical and og:url verification
        const expectedCanonical = `https://www.beforethenumbers.org${expectedPath}`;
        expect(meta.alternates?.canonical).toBe(expectedCanonical);
        expect(meta.openGraph?.url).toBe(expectedCanonical);
        expect(meta.alternates?.canonical).toBe(meta.openGraph?.url);
      });
    }

    it('specifically verifies /hidden-clock points to /hidden-clock and NOT /insulin-reset', () => {
      expect(hiddenClockMetadata.alternates?.canonical).toBe('https://www.beforethenumbers.org/hidden-clock');
      expect(hiddenClockMetadata.openGraph?.url).toBe('https://www.beforethenumbers.org/hidden-clock');
      expect(hiddenClockMetadata.alternates?.canonical).not.toContain('/insulin-reset');
    });
  });
});
