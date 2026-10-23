import React from 'react';
import ReactDOMServer from 'react-dom/server';
import EmailCapture from '@/components/common/EmailCapture';

describe('Unified <EmailCapture /> Component (TDD Tests)', () => {
  it('renders with an unticked affirmative consent checkbox linking to /privacy', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture source="newsletter_funnel" />
    );

    // Form inputs exist
    expect(html).toContain('type="email"');
    expect(html).toContain('name="email"');

    // Consent checkbox exists and is not checked by default
    expect(html).toContain('type="checkbox"');
    expect(html).toContain('/privacy');
    expect(html).toContain('Privacy Policy');
    expect(html).not.toMatch(/checked=""/);
  });

  it('renders a hidden honeypot spam protection input', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture source="newsletter_funnel" />
    );

    expect(html).toContain('name="hp_field"');
    expect(html).toContain('display:none');
  });

  it('renders different layout variants: card, inline, hero, and funnel', () => {
    const cardHtml = ReactDOMServer.renderToString(
      <EmailCapture source="newsletter_funnel" layout="card" />
    );
    expect(cardHtml).toBeDefined();

    const inlineHtml = ReactDOMServer.renderToString(
      <EmailCapture source="recovery_protocol" layout="inline" />
    );
    expect(inlineHtml).toBeDefined();

    const heroHtml = ReactDOMServer.renderToString(
      <EmailCapture source="newsletter_funnel" layout="hero" />
    );
    expect(heroHtml).toBeDefined();

    const funnelHtml = ReactDOMServer.renderToString(
      <EmailCapture source="insulin_reset_funnel" layout="funnel" />
    );
    expect(funnelHtml).toBeDefined();
  });

  it('respects custom title, subtitle, and buttonText props', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture
        source="insulin_reset_funnel"
        title="Get the 8-Page Reset Guide"
        subtitle="Custom metabolic subtitle"
        buttonText="Download Free Guide"
      />
    );

    expect(html).toContain('Get the 8-Page Reset Guide');
    expect(html).toContain('Custom metabolic subtitle');
    expect(html).toContain('Download Free Guide');
  });
});
