import React from 'react';
import GoogleAnalytics from '../../src/components/analytics/GoogleAnalytics';
import { GA_CONFIG } from '../../src/config/constants';

describe('Google Analytics (gtag.js) Integration', () => {
  it('has GA_CONFIG with default measurementId G-Z3316RT5Z7', () => {
    expect(GA_CONFIG).toBeDefined();
    expect(GA_CONFIG.measurementId).toBe('G-Z3316RT5Z7');
  });

  it('renders GoogleAnalytics component successfully with default config', () => {
    const element = <GoogleAnalytics />;
    expect(element).toBeDefined();
    expect(typeof GoogleAnalytics).toBe('function');
  });

  it('renders GoogleAnalytics component with explicit gaId prop', () => {
    const element = <GoogleAnalytics gaId="G-TEST12345" />;
    expect(element).toBeDefined();
    expect(element.props.gaId).toBe('G-TEST12345');
  });

  it('returns null when measurementId is empty string', () => {
    const result = GoogleAnalytics({ gaId: '' });
    expect(result).toBeNull();
  });
});
