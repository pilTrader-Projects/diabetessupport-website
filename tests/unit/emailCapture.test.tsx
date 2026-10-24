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

  it('renders closed state message when mode="closed"', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture source="recovery_protocol" mode="closed" />
    );

    expect(html).toContain('data-testid="email-capture-closed"');
    expect(html).toContain('Registrations Currently Closed');
    expect(html).not.toContain('email-capture-input');
  });

  it('renders default priority waitlist button when mode="waitlist"', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture source="recovery_protocol" mode="waitlist" />
    );

    expect(html).toContain('Join the Waiting List');
    expect(html).toContain('data-testid="email-capture-form"');
  });

  it('appends paused status to title in waitlist mode and renders waitlist badge/notice', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture
        source="recovery_protocol"
        mode="waitlist"
        title="Download the Free Insulin Sensitivity & Recovery Protocol"
        buttonText="Send Me My Recovery Protocol →"
      />
    );

    // Title explicitly appends status
    expect(html).toContain('Download the Free Insulin Sensitivity &amp; Recovery Protocol [Paused - Join Waitlist]');

    // Action button conveys joining the waiting list instead of old download CTA
    expect(html).toContain('Join the Waiting List');
    expect(html).not.toContain('Send Me My Recovery Protocol');

    // Explicit status indicator
    expect(html).toContain('data-testid="email-capture-waitlist-badge"');
    expect(html).toContain('Campaign Paused — Join Waiting List');
  });

  it('does not duplicate status suffix if title already contains waitlist or paused', () => {
    const html = ReactDOMServer.renderToString(
      <EmailCapture
        source="recovery_protocol"
        mode="waitlist"
        title="Insulin Sensitivity Protocol (Waitlist)"
      />
    );

    expect(html).toContain('Insulin Sensitivity Protocol (Waitlist)');
    expect(html).not.toContain('Insulin Sensitivity Protocol (Waitlist) [Paused - Join Waitlist]');
  });

  it('normalizes button text and prevents double arrows (→ →)', () => {
    const activeHtml = ReactDOMServer.renderToString(
      <EmailCapture
        source="recovery_protocol"
        mode="active"
        buttonText="Send Me My Recovery Protocol →"
      />
    );

    // Should only have one arrow, not double arrows
    expect(activeHtml).toContain('Send Me My Recovery Protocol');
    expect(activeHtml).not.toMatch(/→\s*→/);
    expect(activeHtml).not.toMatch(/&rarr;\s*&rarr;/);
    expect(activeHtml).not.toMatch(/→\s*&rarr;/);
  });
});
