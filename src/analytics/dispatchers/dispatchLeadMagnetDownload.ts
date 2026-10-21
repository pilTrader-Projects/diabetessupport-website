import { LeadMagnetDownloadPayload } from '@/analytics/types/analyticsTypes';
import { GA4_EVENTS } from '@/analytics/constants/analyticsConstants';
import { sendGtagEvent } from '@/analytics/utils/gtagTransport';
import { sanitizeString } from '@/analytics/utils/privacySanitizer';
import { getStoredConsent } from '@/lib/consent';

/**
 * Dispatches a lead_magnet_download GA4 conversion event when a visitor downloads or requests a digital asset.
 *
 * MANDATORY PRIVACY: Only non-PII asset file name and source campaign are sent.
 *
 * @param payload Non-PII asset metadata.
 * @param win Optional window reference for dependency injection or testing.
 * @returns boolean indicating whether dispatch succeeded.
 */
export function dispatchLeadMagnetDownload(
  payload: LeadMagnetDownloadPayload,
  win?: Window
): boolean {
  // 1. Consent Verification
  const stored = getStoredConsent(win);
  if (stored && stored.analytics === false) {
    return false;
  }

  // 2. Strict Privacy Sanitization
  const sanitizedPayload: LeadMagnetDownloadPayload = {
    file_name: sanitizeString(payload.file_name, 'unknown_file'),
    source: sanitizeString(payload.source, 'unknown_source'),
    edition: sanitizeString(payload.edition || 'ph', 'ph', 10),
  };

  return sendGtagEvent(GA4_EVENTS.LEAD_MAGNET_DOWNLOAD, sanitizedPayload, win);
}
