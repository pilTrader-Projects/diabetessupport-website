import { CheckoutClickPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';
import { sanitizeString, sanitizeNumber } from '@/analytics/utils/privacySanitizer';
import { getStoredConsent } from '@/lib/consent';

/**
 * Dispatches a checkout_click GA4 conversion event when a visitor initiates a purchase
 * by clicking an outbound checkout link (e.g., Gumroad/Lemon Squeezy for Starter Pack).
 *
 * @param payload Non-PII purchase intent metadata.
 * @param win Optional window reference for dependency injection or testing.
 * @returns boolean indicating whether dispatch succeeded.
 */
export function dispatchCheckoutClick(
  payload: CheckoutClickPayload,
  win?: Window
): boolean {
  // 1. Consent Verification
  const stored = getStoredConsent(win);
  if (stored && stored.analytics === false) {
    return false;
  }

  // 2. Strict Privacy Sanitization
  const sanitizedPayload: CheckoutClickPayload = {
    product_id: sanitizeString(payload.product_id, 'unknown_product'),
    product_name: sanitizeString(payload.product_name, 'unknown_product_name'),
    currency: sanitizeString(payload.currency || 'PHP', 'PHP', 5),
    price: sanitizeNumber(payload.price, 0),
    destination_url: payload.destination_url
      ? sanitizeString(payload.destination_url, '', 300)
      : undefined,
  };

  return sendGtagEvent(GA4_EVENTS.CHECKOUT_CLICK, sanitizedPayload, win);
}
