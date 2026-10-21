import { GtagWindow } from '@/analytics/types/analyticsTypes';

/**
 * Cookie and localStorage persistence keys.
 */
export const CONSENT_COOKIE_NAME = 'bts_consent_preferences';
export const CONSENT_STORAGE_KEY = 'bts_consent_preferences';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60; // 180 days

/**
 * Custom browser event names for decoupled component reactivity.
 */
export const OPEN_CONSENT_MODAL_EVENT = 'bts:open-consent-modal';
export const CONSENT_CHANGED_EVENT = 'bts:consent-changed';

/**
 * Granular cookie categories adhering to Philippine Data Privacy Act (RA 10173)
 * and Google Consent Mode v2 standards.
 */
export interface ConsentCategories {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
}

export interface ConsentPreferences extends ConsentCategories {
  version: number;
  updatedAt: string;
}

export interface GtagConsentSettings {
  ad_storage: 'granted' | 'denied';
  analytics_storage: 'granted' | 'denied';
  ad_user_data: 'granted' | 'denied';
  ad_personalization: 'granted' | 'denied';
  wait_for_update?: number;
}

/**
 * Default privacy-first state for Google Consent Mode v2.
 */
export const DEFAULT_CONSENT_DENIED: GtagConsentSettings = {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500,
};

/**
 * Converts high-level user preferences into Google Consent Mode v2 parameter schema.
 */
export function mapPreferencesToGtagConsent(
  prefs: Pick<ConsentPreferences, 'analytics' | 'marketing'>
): GtagConsentSettings {
  const analyticsGranted = prefs.analytics ? 'granted' : 'denied';
  const marketingGranted = prefs.marketing ? 'granted' : 'denied';

  return {
    analytics_storage: analyticsGranted,
    ad_storage: marketingGranted,
    ad_user_data: marketingGranted,
    ad_personalization: marketingGranted,
  };
}

/**
 * Safely parses and validates a raw stored consent string.
 */
export function parseConsentString(raw: string | null | undefined): ConsentPreferences | null {
  if (!raw || typeof raw !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      parsed.version === CONSENT_VERSION &&
      parsed.necessary === true &&
      typeof parsed.analytics === 'boolean' &&
      typeof parsed.marketing === 'boolean'
    ) {
      return {
        necessary: true,
        analytics: parsed.analytics,
        marketing: parsed.marketing,
        version: parsed.version,
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      };
    }
  } catch {
    // Malformed JSON returns null to trigger clean banner re-prompt
  }

  return null;
}

/**
 * Retrieves stored user consent preferences from cookie or localStorage fallback.
 */
export function getStoredConsent(win?: Window): ConsentPreferences | null {
  const targetWindow = win || (typeof window !== 'undefined' ? window : undefined);
  if (!targetWindow) {
    return null;
  }

  // 1. Try reading from Document Cookie
  try {
    const cookies = targetWindow.document.cookie.split(';');
    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === CONSENT_COOKIE_NAME && value) {
        const parsed = parseConsentString(decodeURIComponent(value));
        if (parsed) return parsed;
      }
    }
  } catch {
    // Cookie read failure fallback
  }

  // 2. Try reading from localStorage fallback
  try {
    const local = targetWindow.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (local) {
      const parsed = parseConsentString(local);
      if (parsed) return parsed;
    }
  } catch {
    // LocalStorage read failure fallback
  }

  return null;
}

/**
 * Persists user consent preferences to both cookie and localStorage,
 * fires gtag consent update, and notifies all listening components.
 */
export function setStoredConsent(
  prefs: Pick<ConsentPreferences, 'analytics' | 'marketing'>,
  win?: Window
): ConsentPreferences {
  const targetWindow = win || (typeof window !== 'undefined' ? window : undefined);
  const consentRecord: ConsentPreferences = {
    necessary: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
    version: CONSENT_VERSION,
    updatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(consentRecord);

  if (targetWindow) {
    // 1. Write Cookie (Lax, 180 days)
    try {
      targetWindow.document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
        serialized
      )}; path=/; max-age=${CONSENT_MAX_AGE_SECONDS}; SameSite=Lax`;
    } catch {
      // Ignored in non-cookie environments
    }

    // 2. Write LocalStorage
    try {
      targetWindow.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
    } catch {
      // Ignored in restricted environments
    }

    // 3. Dispatch Google Consent Mode v2 Update
    dispatchGtagConsentUpdate(consentRecord, targetWindow);

    // 4. Notify reactive UI components
    try {
      targetWindow.dispatchEvent(
        new CustomEvent(CONSENT_CHANGED_EVENT, { detail: consentRecord })
      );
    } catch {
      // CustomEvent dispatch safety
    }
  }

  return consentRecord;
}

/**
 * Dispatches gtag('consent', 'update', ...) command to the Google Tag Manager runtime.
 */
export function dispatchGtagConsentUpdate(
  prefs: Pick<ConsentPreferences, 'analytics' | 'marketing'>,
  win?: Window
): boolean {
  try {
    const targetWindow = (win || (typeof window !== 'undefined' ? window : undefined)) as
      | GtagWindow
      | undefined;

    if (!targetWindow) {
      return false;
    }

    // Ensure dataLayer exists
    targetWindow.dataLayer = targetWindow.dataLayer || [];

    // Ensure gtag function exists
    if (typeof targetWindow.gtag !== 'function') {
      targetWindow.gtag = function () {
        targetWindow.dataLayer?.push(arguments);
      } as any;
    }

    const consentPayload = mapPreferencesToGtagConsent(prefs);
    if (typeof targetWindow.gtag === 'function') {
      targetWindow.gtag('consent', 'update', consentPayload);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Triggers the consent preferences settings modal to open from any component (e.g. Footer).
 */
export function openConsentPreferences(win?: Window): void {
  const targetWindow = win || (typeof window !== 'undefined' ? window : undefined);
  if (!targetWindow) return;

  try {
    targetWindow.dispatchEvent(new CustomEvent(OPEN_CONSENT_MODAL_EVENT));
  } catch {
    // CustomEvent dispatch safety
  }
}
