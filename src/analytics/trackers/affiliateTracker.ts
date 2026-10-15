import { handleAffiliateClick } from '@/analytics/handlers/handleAffiliateClick';

/**
 * Attaches a delegated click listener on a root container (or document/window)
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
    handleAffiliateClick(event);
  };

  (target as any).addEventListener('click', clickListener, true);

  return () => {
    if (typeof (target as any).removeEventListener === 'function') {
      (target as any).removeEventListener('click', clickListener, true);
    }
  };
}
