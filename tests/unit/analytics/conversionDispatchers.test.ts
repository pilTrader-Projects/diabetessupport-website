import {
  dispatchEmailSignup,
  dispatchLeadMagnetDownload,
  dispatchRoadmapStepClick,
  dispatchCheckoutClick,
} from '@/analytics';
import { containsPii, sanitizeString, sanitizeNumber } from '@/analytics/utils/privacySanitizer';
import { CONSENT_STORAGE_KEY, CONSENT_VERSION } from '@/lib/consent';

describe('P1-05 GA4 Conversion Event Dispatchers & Privacy Sanitizer', () => {
  let mockGtag: jest.Mock;

  beforeEach(() => {
    mockGtag = jest.fn();
    (global as any).window = {
      gtag: mockGtag,
      localStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      document: {
        cookie: '',
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Privacy Sanitizer (RA 10173 Compliance)', () => {
    it('accurately identifies emails as PII', () => {
      expect(containsPii('patient@example.com')).toBe(true);
      expect(containsPii('user.name+tag@sub.domain.ph')).toBe(true);
      expect(containsPii('newsletter_footer')).toBe(false);
      expect(containsPii(12345)).toBe(false);
      expect(containsPii(null)).toBe(false);
    });

    it('redacts strings containing email PII to prevent telemetry leakage', () => {
      const sanitized = sanitizeString('patient@example.com');
      expect(sanitized).toBe('redacted_pii');
    });

    it('trims strings and falls back to default values', () => {
      expect(sanitizeString('   ', 'fallback_val')).toBe('fallback_val');
      expect(sanitizeString(undefined, 'fallback_val')).toBe('fallback_val');
      expect(sanitizeString('  valid_source  ')).toBe('valid_source');
    });

    it('sanitizes numbers ensuring finite values', () => {
      expect(sanitizeNumber(299)).toBe(299);
      expect(sanitizeNumber(NaN, 10)).toBe(10);
      expect(sanitizeNumber('not a number', 5)).toBe(5);
    });
  });

  describe('dispatchEmailSignup', () => {
    it('dispatches email_signup with sanitized source and edition', () => {
      const success = dispatchEmailSignup({
        source: 'newsletter_footer',
        edition: 'ph',
      });

      expect(success).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'email_signup', {
        source: 'newsletter_footer',
        edition: 'ph',
      });
    });

    it('strips accidental email PII from source before dispatching', () => {
      const success = dispatchEmailSignup({
        source: 'subscriber_test@gmail.com',
      });

      expect(success).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'email_signup', {
        source: 'redacted_pii',
        edition: 'ph',
      });
    });
  });

  describe('dispatchLeadMagnetDownload', () => {
    it('dispatches lead_magnet_download with clean asset metadata', () => {
      const success = dispatchLeadMagnetDownload({
        file_name: 'the-hidden-metabolic-clock.pdf',
        source: 'insulin_reset_funnel',
        edition: 'ph',
      });

      expect(success).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'lead_magnet_download', {
        file_name: 'the-hidden-metabolic-clock.pdf',
        source: 'insulin_reset_funnel',
        edition: 'ph',
      });
    });
  });

  describe('dispatchRoadmapStepClick', () => {
    it('dispatches roadmap_step_click with valid step number and slug', () => {
      const success = dispatchRoadmapStepClick({
        step_number: 1,
        step_slug: 'understand-insulin-resistance',
        edition: 'ph',
      });

      expect(success).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'roadmap_step_click', {
        step_number: 1,
        step_slug: 'understand-insulin-resistance',
        edition: 'ph',
      });
    });

    it('falls back to safe step number when NaN or non-number is provided', () => {
      const success = dispatchRoadmapStepClick({
        step_number: 'invalid' as any,
        step_slug: 'basics',
      });

      expect(success).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'roadmap_step_click', {
        step_number: 1,
        step_slug: 'basics',
        edition: 'ph',
      });
    });
  });

  describe('dispatchCheckoutClick', () => {
    it('dispatches checkout_click with product pricing and currency', () => {
      const success = dispatchCheckoutClick({
        product_id: 'starter-pack-ph',
        product_name: '30-Day Starter Pack',
        currency: 'PHP',
        price: 299,
        destination_url: 'https://checkout.gumroad.com/l/starterpack',
      });

      expect(success).toBe(true);
      expect(mockGtag).toHaveBeenCalledWith('event', 'checkout_click', {
        product_id: 'starter-pack-ph',
        product_name: '30-Day Starter Pack',
        currency: 'PHP',
        price: 299,
        destination_url: 'https://checkout.gumroad.com/l/starterpack',
      });
    });
  });

  describe('Consent Gating (Google Consent Mode v2)', () => {
    it('suppresses dispatch and returns false when stored consent denies analytics', () => {
      const deniedPrefs = JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        version: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
      });

      ((global as any).window.localStorage.getItem as jest.Mock).mockReturnValue(deniedPrefs);

      const success = dispatchEmailSignup({ source: 'test_source' });
      expect(success).toBe(false);
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('gracefully returns false when window.gtag is not defined', () => {
      (global as any).window.gtag = undefined;

      const success = dispatchEmailSignup({ source: 'test_source' });
      expect(success).toBe(false);
    });
  });
});
