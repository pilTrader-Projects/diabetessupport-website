import {
  VideoTrackingConfig,
  VideoTrackerInstance,
  VideoTrackerState,
} from '@/analytics/types/analyticsTypes';
import { DEFAULT_HEARTBEAT_INTERVAL_MS } from '@/analytics/constants/analyticsConstants';
import { handleVideoPlay } from '@/analytics/handlers/handleVideoPlay';
import { handleVideoPause } from '@/analytics/handlers/handleVideoPause';
import { handleVideoHeartbeat } from '@/analytics/handlers/handleVideoHeartbeat';

/**
 * Creates a decoupled, modular video engagement tracker.
 *
 * @param config Video tracking initialization configuration.
 * @returns VideoTrackerInstance
 */
export function createVideoTracker(config: VideoTrackingConfig): VideoTrackerInstance {
  let videoTitle = config.videoTitle;
  let duration = config.duration || 0;
  let currentTime = 0;
  let isPlaying = false;
  let heartbeatTimer: any = null;
  const heartbeatIntervalMs = config.heartbeatIntervalMs || DEFAULT_HEARTBEAT_INTERVAL_MS;
  const win = config.win;

  const stopHeartbeatTimer = (): void => {
    if (heartbeatTimer !== null) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }
  };

  const startHeartbeatTimer = (): void => {
    stopHeartbeatTimer();
    heartbeatTimer = setInterval(() => {
      if (isPlaying) {
        handleVideoHeartbeat(videoTitle, currentTime, duration, win);
      }
    }, heartbeatIntervalMs);
  };

  const trackPlay = (playTime?: number, dur?: number): boolean => {
    isPlaying = true;
    if (typeof playTime === 'number') {
      currentTime = playTime;
    }
    if (typeof dur === 'number' && dur > 0) {
      duration = dur;
    }

    startHeartbeatTimer();
    return handleVideoPlay(videoTitle, currentTime, duration, win);
  };

  const trackPause = (pauseTime?: number, dur?: number): boolean => {
    isPlaying = false;
    if (typeof pauseTime === 'number') {
      currentTime = pauseTime;
    }
    if (typeof dur === 'number' && dur > 0) {
      duration = dur;
    }

    stopHeartbeatTimer();
    return handleVideoPause(videoTitle, currentTime, duration, win);
  };

  const trackHeartbeat = (hbTime?: number, dur?: number): boolean => {
    if (typeof hbTime === 'number') {
      currentTime = hbTime;
    }
    if (typeof dur === 'number' && dur > 0) {
      duration = dur;
    }

    return handleVideoHeartbeat(videoTitle, currentTime, duration, win);
  };

  const updateCurrentTime = (time: number): void => {
    if (typeof time === 'number' && !isNaN(time)) {
      currentTime = Math.max(0, time);
    }
  };

  const updateDuration = (dur: number): void => {
    if (typeof dur === 'number' && !isNaN(dur) && dur > 0) {
      duration = dur;
    }
  };

  const destroy = (): void => {
    isPlaying = false;
    stopHeartbeatTimer();
  };

  const getState = (): VideoTrackerState => ({
    videoTitle,
    duration,
    currentTime,
    isPlaying,
  });

  return {
    trackPlay,
    trackPause,
    trackHeartbeat,
    updateCurrentTime,
    updateDuration,
    destroy,
    getState,
  };
}
