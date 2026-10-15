import { GtagWindow } from '@/analytics/types/analyticsTypes';

/**
 * Checks if the global gtag function is defined on the window object.
 *
 * @param win Optional window reference for dependency injection or testing.
 * @returns boolean indicating whether window.gtag is available.
 */
export function isGtagAvailable(win?: Window): boolean {
  const targetWindow = (win || (typeof window !== 'undefined' ? window : undefined)) as GtagWindow | undefined;
  return Boolean(targetWindow && typeof targetWindow.gtag === 'function');
}

/**
 * Safely dispatches a GA4 event through the global gtag function.
 *
 * @param eventName The GA4 event name (e.g., 'affiliate_card_click' or 'video_engagement').
 * @param params Event parameters payload.
 * @param win Optional window reference for dependency injection or testing.
 * @returns boolean indicating whether the dispatch succeeded.
 */
export function sendGtagEvent(
  eventName: string,
  params: Record<string, any>,
  win?: Window
): boolean {
  try {
    const targetWindow = (win || (typeof window !== 'undefined' ? window : undefined)) as GtagWindow | undefined;
    if (!targetWindow || typeof targetWindow.gtag !== 'function') {
      return false;
    }

    targetWindow.gtag('event', eventName, params);
    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[GA4 Analytics]: Failed to send event "${eventName}":`, error);
    }
    return false;
  }
}
