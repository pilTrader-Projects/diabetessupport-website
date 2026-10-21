import {
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  DEFAULT_CONSENT_DENIED,
  OPEN_CONSENT_MODAL_EVENT,
  CONSENT_CHANGED_EVENT,
  mapPreferencesToGtagConsent,
  parseConsentString,
  getStoredConsent,
  setStoredConsent,
  dispatchGtagConsentUpdate,
  openConsentPreferences,
} from '@/lib/consent';

function createMockWindow() {
  const store: Record<string, string> = {};
  const eventListeners: Record<string, ((e: any) => void)[]> = {};

  const mockWin: any = {
    document: {
      cookie: '',
    },
    localStorage: {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, val: string) => {
        store[key] = val;
      },
      clear: () => {
        for (const k in store) delete store[k];
      },
    },
    addEventListener: (event: string, handler: (e: any) => void) => {
      eventListeners[event] = eventListeners[event] || [];
      eventListeners[event].push(handler);
    },
    removeEventListener: (event: string, handler: (e: any) => void) => {
      if (eventListeners[event]) {
        eventListeners[event] = eventListeners[event].filter((h) => h !== handler);
      }
    },
    dispatchEvent: (event: any) => {
      const handlers = eventListeners[event.type] || [];
      for (const h of handlers) h(event);
      return true;
    },
    dataLayer: [] as any[],
  };

  return mockWin;
}

describe('Consent Module (src/lib/consent.ts)', () => {
  let mockWin: any;

  beforeEach(() => {
    mockWin = createMockWindow();
  });

  describe('DEFAULT_CONSENT_DENIED', () => {
    it('defines privacy-first denied state with 500ms wait_for_update', () => {
      expect(DEFAULT_CONSENT_DENIED).toEqual({
        ad_storage: 'denied',
        analytics_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });
    });
  });

  describe('mapPreferencesToGtagConsent', () => {
    it('maps all granted when analytics and marketing are true', () => {
      const mapped = mapPreferencesToGtagConsent({ analytics: true, marketing: true });
      expect(mapped).toEqual({
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      });
    });

    it('maps denied when analytics and marketing are false', () => {
      const mapped = mapPreferencesToGtagConsent({ analytics: false, marketing: false });
      expect(mapped).toEqual({
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    });

    it('maps granular preferences accurately', () => {
      const analyticsOnly = mapPreferencesToGtagConsent({ analytics: true, marketing: false });
      expect(analyticsOnly.analytics_storage).toBe('granted');
      expect(analyticsOnly.ad_storage).toBe('denied');

      const marketingOnly = mapPreferencesToGtagConsent({ analytics: false, marketing: true });
      expect(marketingOnly.analytics_storage).toBe('denied');
      expect(marketingOnly.ad_storage).toBe('granted');
    });
  });

  describe('parseConsentString', () => {
    it('returns parsed ConsentPreferences for valid JSON', () => {
      const valid = JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        version: CONSENT_VERSION,
        updatedAt: '2026-10-21T00:00:00.000Z',
      });

      const result = parseConsentString(valid);
      expect(result).not.toBeNull();
      expect(result?.analytics).toBe(true);
      expect(result?.marketing).toBe(false);
      expect(result?.version).toBe(CONSENT_VERSION);
    });

    it('returns null for invalid or tampered payload', () => {
      expect(parseConsentString(null)).toBeNull();
      expect(parseConsentString('')).toBeNull();
      expect(parseConsentString('{invalid json')).toBeNull();
      expect(parseConsentString(JSON.stringify({ analytics: true, marketing: true, version: 1 }))).toBeNull();
      expect(
        parseConsentString(
          JSON.stringify({ necessary: true, analytics: true, marketing: true, version: 999 })
        )
      ).toBeNull();
    });
  });

  describe('getStoredConsent & setStoredConsent', () => {
    it('returns null when no consent has been recorded', () => {
      expect(getStoredConsent(mockWin)).toBeNull();
    });

    it('stores and retrieves consent via document.cookie', () => {
      const stored = setStoredConsent({ analytics: true, marketing: false }, mockWin);
      expect(stored.analytics).toBe(true);
      expect(stored.marketing).toBe(false);
      expect(stored.version).toBe(CONSENT_VERSION);

      const retrieved = getStoredConsent(mockWin);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.analytics).toBe(true);
      expect(retrieved?.marketing).toBe(false);
    });

    it('falls back to localStorage if cookie is absent', () => {
      const payload = {
        necessary: true as const,
        analytics: false,
        marketing: true,
        version: CONSENT_VERSION,
        updatedAt: new Date().toISOString(),
      };
      mockWin.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));

      const retrieved = getStoredConsent(mockWin);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.marketing).toBe(true);
      expect(retrieved?.analytics).toBe(false);
    });

    it('dispatches CONSENT_CHANGED_EVENT on setStoredConsent', () => {
      const listener = jest.fn();
      mockWin.addEventListener(CONSENT_CHANGED_EVENT, listener);

      setStoredConsent({ analytics: true, marketing: true }, mockWin);

      expect(listener).toHaveBeenCalledTimes(1);
      const eventDetail = listener.mock.calls[0][0].detail;
      expect(eventDetail.analytics).toBe(true);
      expect(eventDetail.marketing).toBe(true);

      mockWin.removeEventListener(CONSENT_CHANGED_EVENT, listener);
    });
  });

  describe('dispatchGtagConsentUpdate', () => {
    it('invokes window.gtag with update command and mapped payload', () => {
      const gtagMock = jest.fn();
      mockWin.gtag = gtagMock;

      const success = dispatchGtagConsentUpdate({ analytics: true, marketing: false }, mockWin);
      expect(success).toBe(true);
      expect(gtagMock).toHaveBeenCalledWith('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
    });

    it('creates dataLayer and gtag function on mock window if not already present', () => {
      expect(mockWin.gtag).toBeUndefined();
      const success = dispatchGtagConsentUpdate({ analytics: false, marketing: false }, mockWin);
      expect(success).toBe(true);
      expect(typeof mockWin.gtag).toBe('function');
      expect(mockWin.dataLayer).toBeDefined();
    });
  });

  describe('openConsentPreferences', () => {
    it('dispatches OPEN_CONSENT_MODAL_EVENT on window', () => {
      const listener = jest.fn();
      mockWin.addEventListener(OPEN_CONSENT_MODAL_EVENT, listener);

      openConsentPreferences(mockWin);

      expect(listener).toHaveBeenCalledTimes(1);
      mockWin.removeEventListener(OPEN_CONSENT_MODAL_EVENT, listener);
    });
  });
});
