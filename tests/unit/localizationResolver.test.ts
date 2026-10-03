import { resolveUserRegion, SUPPORTED_REGIONS } from '../../src/lib/localizationResolver';

describe('Localization & Regional Geo-Routing Resolver', () => {
  it('identifies PH as a supported region', () => {
    expect(SUPPORTED_REGIONS).toContain('PH');
  });

  describe('resolveUserRegion logic', () => {
    it('redirects to /ph when x-vercel-ip-country header is PH', () => {
      const result = resolveUserRegion({
        countryHeader: 'PH',
      });
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetPath).toBe('/ph');
      expect(result.detectedRegion).toBe('PH');
    });

    it('redirects to /ph when Cloudflare cf-ipcountry is PH', () => {
      const result = resolveUserRegion({
        cfCountry: 'ph',
      });
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetPath).toBe('/ph');
      expect(result.detectedRegion).toBe('PH');
    });

    it('redirects to /ph when Accept-Language indicates Filipino/Tagalog (fil or en-ph)', () => {
      const result = resolveUserRegion({
        acceptLanguage: 'en-PH,en;q=0.9,fil;q=0.8',
      });
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetPath).toBe('/ph');
      expect(result.detectedRegion).toBe('PH');
    });

    it('routes to root / when country is outside supported list (e.g. US, GB, CA)', () => {
      const resultUS = resolveUserRegion({ countryHeader: 'US' });
      expect(resultUS.shouldRedirect).toBe(false);
      expect(resultUS.targetPath).toBe('/');
      expect(resultUS.detectedRegion).toBe('US');

      const resultGB = resolveUserRegion({ countryHeader: 'GB' });
      expect(resultGB.shouldRedirect).toBe(false);
      expect(resultGB.targetPath).toBe('/');
      expect(resultGB.detectedRegion).toBe('GB');
    });

    it('honors queryEdition=global and prevents redirect even if user is in PH', () => {
      const result = resolveUserRegion({
        countryHeader: 'PH',
        queryEdition: 'global',
      });
      expect(result.shouldRedirect).toBe(false);
      expect(result.targetPath).toBeNull();
      expect(result.detectedRegion).toBe('GLOBAL');
    });

    it('honors cookieRegion=global and stays at root /', () => {
      const result = resolveUserRegion({
        countryHeader: 'PH',
        cookieRegion: 'global',
      });
      expect(result.shouldRedirect).toBe(false);
      expect(result.targetPath).toBeNull();
      expect(result.detectedRegion).toBe('GLOBAL');
    });

    it('honors cookieRegion=ph and redirects to /ph', () => {
      const result = resolveUserRegion({
        cookieRegion: 'ph',
      });
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetPath).toBe('/ph');
      expect(result.detectedRegion).toBe('PH');
    });
  });
});
