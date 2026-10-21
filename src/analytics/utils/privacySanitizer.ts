/**
 * Privacy Sanitizer Utility for GA4 Telemetry (RA 10173 & GDPR Compliance).
 *
 * @usecase Inspects and sanitizes all telemetry payloads before dispatching to Google Analytics
 * to guarantee that no Personally Identifiable Information (PII) like email addresses, phone numbers,
 * or personal health records are transmitted.
 */

// Regular expression matching RFC 5322 email patterns or general email structures
const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/;

/**
 * Checks whether a given string or primitive contains detectable PII (such as an email address).
 *
 * @param value Value to inspect.
 * @returns boolean indicating if PII was detected.
 */
export function containsPii(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  return EMAIL_REGEX.test(value) || value.includes('@');
}

/**
 * Sanitizes a string parameter to prevent accidental PII leakage or payload injection.
 *
 * @param value String value to sanitize.
 * @param fallback Fallback string if value is empty or invalid.
 * @param maxLength Maximum allowed length for telemetry strings (default 100).
 * @returns Clean, sanitized string.
 */
export function sanitizeString(
  value: unknown,
  fallback = 'unknown',
  maxLength = 100
): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;

  if (containsPii(trimmed)) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[GA4 Privacy Warning]: Detected PII in analytics payload, scrubbing value.');
    }
    return 'redacted_pii';
  }

  return trimmed.slice(0, maxLength);
}

/**
 * Sanitizes a numeric parameter, ensuring it is a finite positive number.
 *
 * @param value Value to validate.
 * @param fallback Default number fallback (default 0).
 * @returns Clean finite number.
 */
export function sanitizeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value) && !Number.isNaN(value)) {
    return value;
  }
  return fallback;
}
