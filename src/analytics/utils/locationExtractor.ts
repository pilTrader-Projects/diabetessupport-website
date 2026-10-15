/**
 * Extracts the current page URL safely, returning an empty string if window is not available.
 *
 * @param win Optional window reference for dependency injection or testing.
 * @returns string Current URL or empty string.
 */
export function getCurrentPageLocation(win?: Window): string {
  const targetWindow = win || (typeof window !== 'undefined' ? window : undefined);
  if (!targetWindow || !targetWindow.location || !targetWindow.location.href) {
    return '';
  }
  return targetWindow.location.href;
}
