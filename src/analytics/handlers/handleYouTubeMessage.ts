import { VideoTrackerInstance } from '@/analytics/types/analyticsTypes';

/**
 * Handles incoming postMessage events from embedded YouTube iframes.
 *
 * @param event MessageEvent received on the window.
 * @param tracker VideoTrackerInstance to notify.
 */
export function handleYouTubeMessage(
  event: MessageEvent,
  tracker: VideoTrackerInstance
): void {
  if (!event || !tracker) {
    return;
  }

  // Parse payload data (YouTube iframe API sends JSON string or object)
  let data: any = event.data;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return;
    }
  }

  if (!data || typeof data !== 'object') {
    return;
  }

  // Handle state change (1: playing, 2: paused, 0: ended)
  if (data.event === 'onStateChange' || (data.info && typeof data.info === 'number')) {
    const state = typeof data.info === 'number' ? data.info : data.info?.playerState;
    if (state === 1) {
      tracker.trackPlay();
    } else if (state === 2 || state === 0) {
      tracker.trackPause();
    }
    return;
  }

  // Handle periodic infoDelivery from YouTube player
  if (data.event === 'infoDelivery' && data.info) {
    const info = data.info;
    if (typeof info.currentTime === 'number') {
      tracker.updateCurrentTime(info.currentTime);
    }
    if (typeof info.duration === 'number' && info.duration > 0) {
      tracker.updateDuration(info.duration);
    }
    if (info.playerState === 1) {
      tracker.trackPlay();
    } else if (info.playerState === 2 || info.playerState === 0) {
      tracker.trackPause();
    }
  }
}
