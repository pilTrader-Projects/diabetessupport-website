import { VideoEngagementPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';

/**
 * Dispatches a video_engagement GA4 event.
 *
 * @param payload Formatted video engagement payload.
 * @param win Optional window reference.
 * @returns boolean indicating whether the dispatch succeeded.
 */
export function dispatchVideoEngagement(
  payload: VideoEngagementPayload,
  win?: Window
): boolean {
  return sendGtagEvent(GA4_EVENTS.VIDEO_ENGAGEMENT, payload, win);
}
