import React from 'react';
import ReactDOMServer from 'react-dom/server';
import EditorialPolicyPage, { metadata as editorialMetadata } from '@/app/editorial-policy/page';
import CorrectionsPage, { metadata as correctionsMetadata } from '@/app/corrections/page';
import AboutPage from '@/app/about/page';
import Footer from '@/components/Footer';
import { GET as getSitemap } from '@/app/sitemap.xml/route';
import { PostModel } from '@/models/Post';
import { Thread } from '@/models/Thread';

jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models/Post', () => ({
  PostModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    }),
  },
}));

jest.mock('@/models/Thread', () => ({
  Thread: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    }),
  },
}));

describe('Trust Pages Suite & Governance (Issue #45)', () => {
  describe('Editorial Policy Page (src/app/editorial-policy/page.tsx)', () => {
    it('exports valid metadata with canonical link', () => {
      expect(editorialMetadata.title).toContain('Editorial Policy');
      expect(editorialMetadata.alternates?.canonical).toBe('/editorial-policy');
      expect(editorialMetadata.description).toBeDefined();
    });

    it('renders sourcing standards, 3-layer authority curation workflow, and conflict of interest policy', () => {
      const html = ReactDOMServer.renderToString(<EditorialPolicyPage />);

      expect(html).toContain('Editorial Policy &amp; Standards');
      expect(html).toContain('Evidence-First Sourcing Criteria');
      expect(html).toContain('Peer-Reviewed Journals');
      expect(html).toContain('Consensus Guidelines');
      expect(html).toContain('Conflict of Interest &amp; Commercial Independence');
      expect(html).toContain('Zero Pharmaceutical Sponsorship');
      expect(html).toContain('3-Layer Authority Curation &amp; Safety Workflow');
      expect(html).toContain('Primary Verified Authority');
      expect(html).toContain('Clinical Safety Hedging');
      expect(html).toContain('12-Month Scheduled Review Cycle');
      expect(html).not.toContain('href="/medical-review-board"');
    });
  });

  describe('Corrections Policy Page (src/app/corrections/page.tsx)', () => {
    it('exports valid metadata with canonical link', () => {
      expect(correctionsMetadata.title).toContain('Corrections Policy');
      expect(correctionsMetadata.alternates?.canonical).toBe('/corrections');
    });

    it('renders error reporting procedures, response timeframe, and public change log', () => {
      const html = ReactDOMServer.renderToString(<CorrectionsPage />);

      expect(html).toContain('Editorial Corrections Policy');
      expect(html).toContain('Commitment to Accuracy &amp; Scientific Integrity');
      expect(html).toContain('How to Report an Inaccuracy');
      expect(html).toContain('corrections@beforethenumbers.org');
      expect(html).toContain('24 to 48 hours');
      expect(html).toContain('Public Editorial Change Log');
      expect(html).not.toContain('href="/medical-review-board"');
    });
  });

  describe('Updated About Page Governance Disclosure (src/app/about/page.tsx)', () => {
    it('renders clear open-access governance, non-tax-exempt status, and funding disclosure', () => {
      const html = ReactDOMServer.renderToString(<AboutPage />);

      expect(html).toContain('Governance &amp; Funding Transparency');
      expect(html).toContain('Independent Public Health Educational Initiative');
      expect(html).toContain('not a registered 501(c)(3) or tax-exempt non-profit');
      expect(html).toContain('self-funded by the founder');
      expect(html).toContain('href="/editorial-policy"');
      expect(html).toContain('href="/corrections"');
      expect(html).not.toContain('href="/medical-review-board"');
    });
  });

  describe('Global Footer Navigation & Security Notice (src/app/layout.tsx)', () => {
    it('renders links to all trust pages and realigned privacy notice in footer without medical-review-board', () => {
      const html = ReactDOMServer.renderToString(<Footer />);

      expect(html).toContain('href="/editorial-policy"');
      expect(html).toContain('Editorial Policy');
      expect(html).not.toContain('href="/medical-review-board"');
      expect(html).not.toContain('Medical Review Board');
      expect(html).toContain('href="/corrections"');
      expect(html).toContain('Corrections');
      expect(html).toContain('href="/about"');
      expect(html).toContain('About Us');
      expect(html).toContain('localStorage');
      expect(html).toContain('ephemeral 6-digit PIN');
      expect(html).toContain('zero health records stored on a central server');
    });
  });

  describe('Dynamic Sitemap XML (src/app/sitemap.xml/route.ts)', () => {
    it('includes active trust pages in sitemap output and excludes medical-review-board', async () => {
      const response = await getSitemap();
      const text = await response.text();

      expect(text).toContain('/editorial-policy');
      expect(text).toContain('/corrections');
      expect(text).not.toContain('/medical-review-board');
    });
  });
});
