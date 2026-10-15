/**
 * Calculates the video completion percentage clamped between 0 and 100 with one decimal precision.
 *
 * @param currentTime Current playback time in seconds.
 * @param duration Total video duration in seconds.
 * @returns number Calculated completion percentage (0 - 100).
 */
export function calculateCompletionPercentage(currentTime: number, duration: number): number {
  if (!duration || duration <= 0) {
    return 0;
  }

  const clampedTime = Math.max(0, Math.min(currentTime, duration));
  const rawPercentage = (clampedTime / duration) * 100;
  return Math.round(rawPercentage * 10) / 10;
}
