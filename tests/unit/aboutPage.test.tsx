import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AboutPage, { metadata as aboutMetadata } from '@/app/about/page';
import FounderStoryPage, { metadata as storyMetadata } from '@/app/about/story/page';

describe('AboutPage & Founder Story Flow', () => {
  describe('About Us Main Page (src/app/about/page.tsx)', () => {
    it('exports valid SEO metadata and canonical link', () => {
      expect(aboutMetadata.title).toContain('About Us & Mission');
      expect(aboutMetadata.alternates?.canonical).toBe('/about');
      expect(aboutMetadata.description).toBeDefined();
    });

    it('renders the foundational sections and refined copy', () => {
      const html = ReactDOMServer.renderToString(<AboutPage />);

      expect(html).toContain('Protecting Filipino Families from the Silent Threat of Diabetes');
      expect(html).toContain('Why DiabetesCare PH Exists');
      expect(html).toContain('silent financial and emotional catastrophe');
      expect(html).toContain('Earlier Awareness');
      expect(html).toContain('Evidence-Based &amp; Local');
      expect(html).toContain('GlycoSense Ecosystem');
      expect(html).toContain('Editorial &amp; Independence Standards');
    });

    it('renders an impactful, concise gist of the founder personal story with byline and link to the full article', () => {
      const html = ReactDOMServer.renderToString(<AboutPage />);

      expect(html).toContain('The Personal Story Behind Our Advocacy');
      expect(html).toContain('Founder &amp; Patient Advocate');
      expect(html).toContain('Chris');
      expect(html).toContain('36 years old');
      expect(html).toContain('the diagnosis is not where the story begins');
      expect(html).toContain('Don&#x27;t wait for the disease to become loud');

      // Link to the full article
      expect(html).toContain('href="/about/story"');
      expect(html).toContain('Why We Started This Mission');
    });

    it('renders JSON-LD MedicalOrganization structured data', () => {
      const html = ReactDOMServer.renderToString(<AboutPage />);
      expect(html).toContain('application/ld+json');
      expect(html).toContain('MedicalOrganization');
      expect(html).toContain('DiabetesCare PH');
    });
  });

  describe('Full Founder Story Page (src/app/about/story/page.tsx)', () => {
    it('exports dedicated SEO metadata and canonical URL', () => {
      expect(storyMetadata.title).toContain('Why We Started This Mission');
      expect(storyMetadata.alternates?.canonical).toBe('/about/story');
    });

    it('renders the complete personal story, founder byline, and mission', () => {
      const html = ReactDOMServer.renderToString(<FounderStoryPage />);

      expect(html).toContain('Why We Started This Mission');
      expect(html).toContain('We Don&#x27;t Want Families to Discover Diabetes Too Late');
      expect(html).toContain('Founder &amp; Patient Advocate');
      expect(html).toContain('Chris');
      expect(html).toContain('36 years old, he was gone');
      expect(html).toContain('What is insulin resistance?');
      expect(html).toContain('This Is Why We Are Raising the Flag');
      expect(html).toContain('A flag of awareness');
      expect(html).toContain('Don&#x27;t cross the road blindly');

      // Link back to About Us
      expect(html).toContain('href="/about"');
      expect(html).toContain('Back to About Us');
    });

    it('renders the Next Steps Action Card with direct pathways to funnels, community, and tools', () => {
      const html = ReactDOMServer.renderToString(<FounderStoryPage />);

      expect(html).toContain('Where Do We Go From Here?');
      expect(html).toContain('href="/insulin-reset"');
      expect(html).toContain('href="/community"');
      expect(html).toContain('href="/glycosense"');
    });

    it('renders JSON-LD Article structured data', () => {
      const html = ReactDOMServer.renderToString(<FounderStoryPage />);
      expect(html).toContain('application/ld+json');
      expect(html).toContain('Article');
    });
  });
});
