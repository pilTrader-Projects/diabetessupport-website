import React from 'react';
import ReactDOMServer from 'react-dom/server';
import PrivacyPage, { metadata as privacyMetadata } from '@/app/privacy/page';
import TermsPage, { metadata as termsMetadata } from '@/app/terms/page';

describe('Markdown-driven legal pages (P0-01)', () => {
  it('/privacy exports metadata with canonical /privacy', () => {
    expect(privacyMetadata.title).toBe('Privacy Policy & Data Security Notice | Before the Numbers');
    expect(privacyMetadata.alternates?.canonical).toBe('/privacy');
  });

  it('/terms exports metadata with canonical /terms', () => {
    expect(termsMetadata.title).toBe('Terms of Service & Medical Safe Harbor | Before the Numbers');
    expect(termsMetadata.alternates?.canonical).toBe('/terms');
  });

  it('privacy renders a single h1, last-updated line and original wording', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<PrivacyPage />);
    expect((html.match(/<h1/g) || []).length).toBe(1);
    expect(html).toContain('Privacy Policy &amp; Data Protection');
    expect(html).toContain('Last Updated: October 2026');
    expect(html).toContain('Republic Act No. 10173');
    expect(html).toContain('Zero health records are stored on a central server');
    expect(html).toContain('href="mailto:dpo@beforethenumbers.org"');
    expect(html).toContain('href="/terms"');
    expect(html).toContain('href="/contact"');
  });

  it('privacy external links open safely', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<PrivacyPage />);
    expect(html).toContain('href="https://myadcenter.google.com/"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it('terms renders disclaimer, numbered sections and placeholders resolved', () => {
    const html = ReactDOMServer.renderToStaticMarkup(<TermsPage />);
    expect((html.match(/<h1/g) || []).length).toBe(1);
    expect(html).toContain('Mandatory Medical &amp; Non-Diagnostic Disclaimer');
    expect(html).toContain('Software as a Medical Device (SaMD) Safe Harbor');
    expect(html).toContain('Limitation of Liability');
    expect(html).toContain('owned by Before the Numbers');
    expect(html).toContain('Platform: www.beforethenumbers.org');
    expect(html).not.toContain('{{');
    expect(html).toContain('href="/privacy"');
    expect(html).toContain('href="/about"');
  });
});
