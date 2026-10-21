import React from 'react';
import ReactDOMServer from 'react-dom/server';
import ConsentBanner from '@/components/common/ConsentBanner';
import CookieSettingsButton from '@/components/common/CookieSettingsButton';
import Footer from '@/components/Footer';

describe('Consent UI Components (ConsentBanner & CookieSettingsButton)', () => {
  describe('ConsentBanner Component', () => {
    it('is a valid React component function', () => {
      expect(typeof ConsentBanner).toBe('function');
    });

    it('instantiates the ConsentBanner element without throwing', () => {
      const element = <ConsentBanner />;
      expect(element).toBeDefined();
      expect(element.type).toBe(ConsentBanner);
    });

    it('renders null initially during SSR to prevent hydration mismatches', () => {
      // In SSR (before useEffect mounts), mounted is false, so it returns null
      const markup = ReactDOMServer.renderToStaticMarkup(<ConsentBanner />);
      expect(markup).toBe('');
    });
  });

  describe('CookieSettingsButton Component', () => {
    it('is a valid React component function', () => {
      expect(typeof CookieSettingsButton).toBe('function');
    });

    it('renders with default label and id="footer-cookie-settings-btn"', () => {
      const markup = ReactDOMServer.renderToStaticMarkup(<CookieSettingsButton />);
      expect(markup).toContain('id="footer-cookie-settings-btn"');
      expect(markup).toContain('Cookie Settings');
      expect(markup).toContain('aria-label="Open cookie preferences and consent modal"');
    });

    it('supports custom class names and custom labels', () => {
      const markup = ReactDOMServer.renderToStaticMarkup(
        <CookieSettingsButton className="custom-test-btn" label="Manage Privacy" />
      );
      expect(markup).toContain('custom-test-btn');
      expect(markup).toContain('Manage Privacy');
    });
  });

  describe('Footer Integration', () => {
    it('renders CookieSettingsButton inside the application Footer', () => {
      const html = ReactDOMServer.renderToStaticMarkup(<Footer />);
      expect(html).toContain('id="footer-cookie-settings-btn"');
      expect(html).toContain('Cookie Settings');
    });
  });
});
