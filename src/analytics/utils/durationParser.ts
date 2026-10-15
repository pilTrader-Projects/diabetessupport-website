/**
 * Parses a duration string (e.g. "45:00", "1:30:15", "120s") or number into total seconds.
 *
 * @param duration Raw duration value.
 * @returns number Total duration in seconds.
 */
export function parseDurationToSeconds(duration: string | number | undefined): number {
  if (typeof duration === 'number') {
    return isNaN(duration) || duration < 0 ? 0 : duration;
  }

  if (!duration || typeof duration !== 'string') {
    return 0;
  }

  const clean = duration.trim();
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return parseFloat(clean);
  }

  const parts = clean.split(':').map((p) => parseFloat(p.trim()));
  if (parts.some((p) => isNaN(p))) {
    return 0;
  }

  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }

  return 0;
}
