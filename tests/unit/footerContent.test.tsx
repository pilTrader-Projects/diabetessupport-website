import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Footer from '@/components/Footer';
import { getLegalDocument } from '@/lib/legalContent';

describe('Footer notices are markdown-driven (src/content/legal/footer.md)', () => {
  it('loads copyright and notice paragraphs from markdown with year/author resolved', () => {
    const doc = getLegalDocument('footer');
    expect(doc.meta.copyright).toBe(`© ${new Date().getFullYear()} Before the Numbers. All rights reserved.`);
    expect(doc.body).toContain('**Medical Disclaimer:**');
    expect(doc.body).toContain('**Data Privacy & Security Notice:**');
  });

  it('renders the exact displayed footer wording from the markdown file', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<Footer />);

    expect(html).toContain(`© ${new Date().getFullYear()} Before the Numbers. All rights reserved.`);
    expect(html).toContain('Medical Disclaimer:');
    expect(html).toContain('is an independent health awareness and educational movement.');
    expect(html).toContain('Always consult a qualified healthcare provider regarding your individual health conditions.');
    expect(html).toContain('Data Privacy &amp; Security Notice:');
    expect(html).toContain('Republic Act No. 10173 (Philippine Data Privacy Act of 2012)');
    expect(html).toContain('We never sell, rent, or disclose your personal information to third parties, advertisers, or insurers.');
    expect(html).not.toContain('{{');
  });

  it('keeps the footer notice labels bold white and links to the legal pages', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<Footer />);
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/terms"');
    expect(html).toMatch(/<strong[^>]*>Medical Disclaimer:<\/strong>/);
  });
});
