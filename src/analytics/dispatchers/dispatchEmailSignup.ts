import { EmailSignupPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';
import { sanitizeString } from '@/analytics/utils/privacySanitizer';
import { getStoredConsent } from '@/lib/consent';

/**
 * Dispatches an email_signup GA4 conversion event when a visitor opts into a newsletter or lead magnet.
 *
 * MANDATORY PRIVACY: Strictly non-PII. Email addresses and names are actively stripped to comply
 * with Philippine Data Privacy Act (RA 10173).
 *
 * @param payload Non-PII campaign source and regional edition.
 * @param win Optional window reference for dependency injection or testing.
 * @returns boolean indicating whether dispatch succeeded.
 */
export function dispatchEmailSignup(
  payload: EmailSignupPayload,
  win?: Window
): boolean {
  // 1. Consent Verification: If consent was explicitly stored and analytics was denied, drop event
  const stored = getStoredConsent(win);
  if (stored && stored.analytics === false) {
    return false;
  }

  // 2. Strict Privacy Sanitization
  const sanitizedPayload: EmailSignupPayload = {
    source: sanitizeString(payload.source, 'unknown_source'),
    edition: sanitizeString(payload.edition || 'ph', 'ph', 10),
  };

  return sendGtagEvent(GA4_EVENTS.EMAIL_SIGNUP, sanitizedPayload, win);
}
