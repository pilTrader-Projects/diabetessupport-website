import { useEffect } from 'react';
import { createVideoTracker } from '@/analytics/trackers/videoTracker';
import { bindYouTubeIframeTracking } from '@/analytics/trackers/bindYouTubeIframeTracking';
import { parseDurationToSeconds } from '@/analytics/utils/durationParser';

/**
 * Executes the core video tracking lifecycle, setting up tracker and listeners,
 * returning a cleanup function.
 *
 * @param isOpen Whether the video player is currently active/open.
 * @param title Video title.
 * @param duration Video duration.
 * @returns Cleanup function or undefined if inactive.
 */
export function runVideoTrackingLifecycle(
  isOpen: boolean,
  title?: string,
  duration?: string | number
): (() => void) | undefined {
  if (!isOpen || !title) {
    return undefined;
  }

  const durationSeconds = parseDurationToSeconds(duration);
  const tracker = createVideoTracker({
    videoTitle: title,
    duration: durationSeconds,
  });

  // YouTube iframe embed has autoplay=1 enabled
  tracker.trackPlay(0, durationSeconds);

  const unbind = bindYouTubeIframeTracking(tracker);

  return () => {
    unbind();
    tracker.destroy();
  };
}

/**
 * React hook to manage embedded video tracking lifecycle for modals and players.
 *
 * @param isOpen Whether the video player is currently active/open.
 * @param title Video title.
 * @param duration Video duration (string like "45:00" or number in seconds).
 */
export function useVideoTracking(
  isOpen: boolean,
  title?: string,
  duration?: string | number
): void {
  useEffect(() => {
    return runVideoTrackingLifecycle(isOpen, title, duration);
  }, [isOpen, title, duration]);
}
