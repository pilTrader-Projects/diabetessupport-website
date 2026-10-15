import {
  VideoEngagementPayload,
  VideoEngagementAction,
} from '@/analytics/types/analyticsTypes';
import { calculateCompletionPercentage } from '@/analytics/utils/percentageCalculator';

interface FormatVideoEngagementParams {
  videoTitle: string;
  currentTime: number;
  duration: number;
  action: VideoEngagementAction;
}

/**
 * Formats video playback parameters into a clean GA4 video_engagement event payload.
 *
 * @param params Formatting input parameters.
 * @returns VideoEngagementPayload adhering strictly to GA4 specification.
 */
export function formatVideoEngagementPayload({
  videoTitle,
  currentTime,
  duration,
  action,
}: FormatVideoEngagementParams): VideoEngagementPayload {
  const cleanTime = Math.max(0, Math.round(currentTime * 10) / 10);
  const completionPercentage = calculateCompletionPercentage(cleanTime, duration);

  return {
    video_title: videoTitle || 'unknown_video',
    video_current_time: cleanTime,
    engagement_action: action,
    completion_percentage: completionPercentage,
  };
}
