import { AffiliateCardContext } from '@/analytics/types/analyticsTypes';
import { AFFILIATE_CLICK_TYPE } from '@/analytics/constants/analyticsConstants';

/**
 * Extracts affiliate context data from an anchor element matching the affiliate pattern.
 *
 * @param element Target DOM element.
 * @returns AffiliateCardContext or null if element is invalid or not an affiliate card.
 */
export function extractAffiliateCardContext(element: Element | null): AffiliateCardContext | null {
  if (!element || typeof element.getAttribute !== 'function') {
    return null;
  }

  const clickType = element.getAttribute('data-click-type');
  if (clickType !== AFFILIATE_CLICK_TYPE) {
    return null;
  }

  const bookTitle = element.getAttribute('data-book-title') || '';
  const cardPosition = element.getAttribute('data-card-position') || '';
  const destinationUrl = element.getAttribute('href') || '';

  return {
    bookTitle,
    cardPosition,
    destinationUrl,
  };
}

/**
 * Finds the closest ancestor anchor element matching the affiliate card attribute selector.
 *
 * @param target Event target.
 * @returns Closest matching HTMLAnchorElement or null.
 */
export function findClosestAffiliateCard(target: EventTarget | null): HTMLAnchorElement | null {
  if (!target || typeof (target as any).closest !== 'function') {
    return null;
  }

  return (target as any).closest(`a[data-click-type="${AFFILIATE_CLICK_TYPE}"]`);
}
