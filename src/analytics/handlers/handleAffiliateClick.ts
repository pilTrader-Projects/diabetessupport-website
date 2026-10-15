import {
  extractAffiliateCardContext,
  findClosestAffiliateCard,
} from '@/analytics/utils/domExtractors';
import { getCurrentPageLocation } from '@/analytics/utils/locationExtractor';
import { formatAffiliateClickPayload } from '@/analytics/formatters/formatAffiliateClickPayload';
import { dispatchAffiliateCardClick } from '@/analytics/dispatchers/dispatchAffiliateCardClick';

interface ClickEventLike {
  target?: EventTarget | null;
  currentTarget?: EventTarget | null;
}

/**
 * Handles affiliate card click interactions passively.
 * Extracts context, formats payload, and dispatches GA4 affiliate_card_click event.
 * NOTE: Strictly passive — never interferes with event propagation or default actions.
 *
 * @param event DOM click event or event-like object.
 * @param win Optional window reference.
 * @returns boolean indicating whether the click was identified and dispatched.
 */
export function handleAffiliateClick(
  event: ClickEventLike,
  win?: Window
): boolean {
  const anchor =
    findClosestAffiliateCard(event.currentTarget || null) ||
    findClosestAffiliateCard(event.target || null);

  if (!anchor) {
    return false;
  }

  const context = extractAffiliateCardContext(anchor);
  if (!context) {
    return false;
  }

  const pageLocation = getCurrentPageLocation(win);
  const payload = formatAffiliateClickPayload(context, pageLocation);
  return dispatchAffiliateCardClick(payload, win);
}
