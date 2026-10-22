import React from 'react';
import ReactDOMServer from 'react-dom/server';
import AdUnit from '@/components/ads/AdUnit';

describe('AdUnit Consent-Gating & House Ad Fallback (TDD Tests)', () => {
  it('renders zero-cookie house PWA fallback by default without marketing consent', () => {
    const html = ReactDOMServer.renderToString(
      <AdUnit slotId="1234567890" fallbackType="pwa" />
    );

    // Should NOT render Google AdSense ins tag or Advertisement label
    expect(html).not.toContain('class="adsbygoogle');
    expect(html).not.toContain('Advertisement');

    // Should render GlycoSense House Promotion
    expect(html).toContain('GlycoSense');
    expect(html).toContain('Smart Health Companion');
    expect(html).toContain('Explore GlycoSense Free');
  });

  it('renders cheatsheet fallback when fallbackType="cheatsheet" without marketing consent', () => {
    const html = ReactDOMServer.renderToString(
      <AdUnit slotId="1234567890" fallbackType="cheatsheet" />
    );

    // Should NOT render Google AdSense ins tag or Advertisement label
    expect(html).not.toContain('class="adsbygoogle');
    expect(html).not.toContain('Advertisement');

    // Should render Cheatsheet House Promotion
    expect(html).toContain('Free Patient Resource');
    expect(html).toContain('Download the 7-Day Diabetes Action Plan');
    expect(html).toContain('/guides/cheatsheet');
  });
});
