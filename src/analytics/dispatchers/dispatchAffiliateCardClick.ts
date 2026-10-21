import { AffiliateCardClickPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';
import { getStoredConsent } from '@/lib/consent';
import { sanitizeString } from '@/analytics/utils/privacySanitizer';

/**
 * Dispatches an affiliate_card_click GA4 event with privacy sanitization and consent gating.
 *
 * @param payload Formatted affiliate card click payload.
 * @param win Optional window reference.
 * @returns boolean indicating whether the dispatch succeeded.
 */
export function dispatchAffiliateCardClick(
  payload: AffiliateCardClickPayload,
  win?: Window
): boolean {
  // 1. Consent Verification: If consent was explicitly stored and analytics was denied, abort
  const stored = getStoredConsent(win);
  if (stored && stored.analytics === false) {
    return false;
  }

  const sanitizedPayload: AffiliateCardClickPayload = {
    page_location: sanitizeString(payload.page_location, '', 150),
    affiliate_item: sanitizeString(payload.affiliate_item, 'Affiliate Item', 100),
    card_layout_position: sanitizeString(payload.card_layout_position, 'inline', 50),
    destination_url: sanitizeString(payload.destination_url, '', 250),
  };

  return sendGtagEvent(GA4_EVENTS.AFFILIATE_CARD_CLICK, sanitizedPayload, win);
}
