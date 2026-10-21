import { RoadmapStepClickPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';
import { sanitizeString, sanitizeNumber } from '@/analytics/utils/privacySanitizer';
import { getStoredConsent } from '@/lib/consent';

/**
 * Dispatches a roadmap_step_click GA4 conversion event when a visitor navigates through
 * educational curriculum steps (e.g., on /learn roadmap or step pages).
 *
 * @param payload Non-PII step navigation details.
 * @param win Optional window reference for dependency injection or testing.
 * @returns boolean indicating whether dispatch succeeded.
 */
export function dispatchRoadmapStepClick(
  payload: RoadmapStepClickPayload,
  win?: Window
): boolean {
  // 1. Consent Verification
  const stored = getStoredConsent(win);
  if (stored && stored.analytics === false) {
    return false;
  }

  // 2. Strict Privacy Sanitization
  const sanitizedPayload: RoadmapStepClickPayload = {
    step_number: sanitizeNumber(payload.step_number, 1),
    step_slug: sanitizeString(payload.step_slug, 'unknown_step'),
    edition: sanitizeString(payload.edition || 'ph', 'ph', 10),
  };

  return sendGtagEvent(GA4_EVENTS.ROADMAP_STEP_CLICK, sanitizedPayload, win);
}
