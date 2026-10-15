import {
  extractAffiliateCardContext,
  findClosestAffiliateCard,
} from '@/analytics/utils/domExtractors';
import { getCurrentPageLocation } from '@/analytics/utils/locationExtractor';
import { formatAffiliateClickPayload } from '@/analytics/formatters/formatAffiliateClickPayload';
import { dispatchAffiliateCardClick } from '@/analytics/dispatchers/dispatchAffiliateCardClick';

/**
 * Attaches a non-intrusive delegated click listener on a root container (or document/window)
 * to automatically capture clicks on any anchor matching data-click-type="affiliate_card".
 *
 * @param root Target container element or document.
 * @returns Cleanup function to remove the event listener.
 */
export function attachAffiliateTracking(
  root?: HTMLElement | Document | Window
): () => void {
  const target =
    root ||
    (typeof document !== 'undefined'
      ? document
      : typeof window !== 'undefined'
      ? window
      : undefined);

  if (!target || typeof (target as any).addEventListener !== 'function') {
    return () => {};
  }

  const clickListener = (event: any) => {
    // Passive guard: strictly ignore events that do not originate from an affiliate card
    const anchor = findClosestAffiliateCard(event?.target || null);
    if (!anchor) {
      return;
    }

    const context = extractAffiliateCardContext(anchor);
    if (!context) {
      return;
    }

    const pageLocation = getCurrentPageLocation();
    const payload = formatAffiliateClickPayload(context, pageLocation);
    dispatchAffiliateCardClick(payload);
  };

  // Passive bubbling phase listener (false) so normal application clicks are never blocked
  (target as any).addEventListener('click', clickListener, false);

  return () => {
    if (typeof (target as any).removeEventListener === 'function') {
      (target as any).removeEventListener('click', clickListener, false);
    }
  };
}
