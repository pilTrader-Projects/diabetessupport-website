import { AffiliateCardClickPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';

/**
 * Dispatches an affiliate_card_click GA4 event.
 *
 * @param payload Formatted affiliate card click payload.
 * @param win Optional window reference.
 * @returns boolean indicating whether the dispatch succeeded.
 */
export function dispatchAffiliateCardClick(
  payload: AffiliateCardClickPayload,
  win?: Window
): boolean {
  return sendGtagEvent(GA4_EVENTS.AFFILIATE_CARD_CLICK, payload, win);
}
