/**
 * Supported regional country codes.
 * Extensible for future country chapters (e.g. US, UK, SG, MY).
 */
export const SUPPORTED_REGIONS = ['PH'] as const;
export type SupportedRegion = (typeof SUPPORTED_REGIONS)[number];

export interface GeoDetectionInput {
  countryHeader?: string | null;
  cfCountry?: string | null;
  geoCountry?: string | null;
  acceptLanguage?: string | null;
  cookieRegion?: string | null;
  queryEdition?: string | null;
}

export interface LocalizationResolutionResult {
  targetPath: string | null;
  shouldRedirect: boolean;
  detectedRegion: string | null;
}

/**
 * Resolves user localization based on edge geo headers, language headers, query params, and cookies.
 *
 * @usecase Routes visitors from supported countries (e.g. Philippines -> /ph) by default,
 * while directing all other or unsupported countries to the global root ('/').
 * Prevents redirect loops when a user explicitly chooses the global edition.
 *
 * @param {GeoDetectionInput} input Collection of edge request metadata.
 * @returns {LocalizationResolutionResult} Resolved redirection decision and detected region.
 */
export function resolveUserRegion(input: GeoDetectionInput): LocalizationResolutionResult {
  const query = (input.queryEdition || '').toLowerCase().trim();
  const cookie = (input.cookieRegion || '').toLowerCase().trim();

  // 1. Explicit user override: 'global' edition selected
  if (query === 'global' || cookie === 'global') {
    return {
      targetPath: null,
      shouldRedirect: false,
      detectedRegion: 'GLOBAL',
    };
  }

  // 2. Explicit user override: 'ph' edition selected
  if (query === 'ph' || cookie === 'ph') {
    return {
      targetPath: '/ph',
      shouldRedirect: true,
      detectedRegion: 'PH',
    };
  }

  // 3. Inspect GeoIP Edge Headers (Vercel, Cloudflare, AWS CloudFront, or standard x-country-code)
  const rawCountry = (
    input.countryHeader ||
    input.cfCountry ||
    input.geoCountry ||
    ''
  ).toUpperCase().trim();

  if (rawCountry === 'PH') {
    return {
      targetPath: '/ph',
      shouldRedirect: true,
      detectedRegion: 'PH',
    };
  }

  // 4. Secondary heuristic: Accept-Language for Philippines
  if (!rawCountry && input.acceptLanguage) {
    const lang = input.acceptLanguage.toLowerCase();
    if (lang.includes('fil') || lang.includes('tl') || lang.includes('en-ph')) {
      return {
        targetPath: '/ph',
        shouldRedirect: true,
        detectedRegion: 'PH',
      };
    }
  }

  // 5. Future supported region check
  if (rawCountry && (SUPPORTED_REGIONS as readonly string[]).includes(rawCountry)) {
    return {
      targetPath: `/${rawCountry.toLowerCase()}`,
      shouldRedirect: true,
      detectedRegion: rawCountry,
    };
  }

  // 6. Default to global root ('/') for unsupported regions or global traffic
  return {
    targetPath: '/',
    shouldRedirect: false,
    detectedRegion: rawCountry || 'UNKNOWN',
  };
}
