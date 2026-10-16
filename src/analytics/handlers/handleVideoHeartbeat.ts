import { formatVideoEngagementPayload } from '@/analytics/formatters/formatVideoEngagementPayload';
import { dispatchVideoEngagement } from '@/analytics/dispatchers/dispatchVideoEngagement';
import { VIDEO_ENGAGEMENT_ACTIONS } from '@/analytics/constants/analyticsConstants';

/**
 * Handles video periodic heartbeat engagement marker.
 *
 * @param videoTitle Title of the video.
 * @param currentTime Current playback time in seconds.
 * @param duration Total video duration in seconds.
 * @param win Optional window reference.
 * @returns boolean indicating whether the event was dispatched.
 */
export function handleVideoHeartbeat(
  videoTitle: string,
  currentTime: number,
  duration: number,
  win?: Window
): boolean {
  const payload = formatVideoEngagementPayload({
    videoTitle,
    currentTime,
    duration,
    action: VIDEO_ENGAGEMENT_ACTIONS.HEARTBEAT,
  });

  return dispatchVideoEngagement(payload, win);
}
