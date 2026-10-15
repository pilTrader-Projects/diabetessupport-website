import { VideoTrackerInstance } from '@/analytics/types/analyticsTypes';
import { handleYouTubeMessage } from '@/analytics/handlers/handleYouTubeMessage';

/**
 * Binds a window message listener for YouTube iframe postMessage events.
 *
 * @param tracker VideoTrackerInstance to forward events to.
 * @param win Optional window reference.
 * @returns Cleanup function to unbind the listener.
 */
export function bindYouTubeIframeTracking(
  tracker: VideoTrackerInstance,
  win?: Window
): () => void {
  const targetWindow = win || (typeof window !== 'undefined' ? window : undefined);
  if (!targetWindow || typeof targetWindow.addEventListener !== 'function') {
    return () => {};
  }

  const messageHandler = (event: MessageEvent) => {
    handleYouTubeMessage(event, tracker);
  };

  targetWindow.addEventListener('message', messageHandler);

  return () => {
    if (typeof targetWindow.removeEventListener === 'function') {
      targetWindow.removeEventListener('message', messageHandler);
    }
  };
}
