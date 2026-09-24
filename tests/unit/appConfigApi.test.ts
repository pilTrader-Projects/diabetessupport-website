/**
 * Unit Test Suite for Public App Configuration API (/api/v1/app-config).
 *
 * @usecase Validates that GET /api/v1/app-config returns active dynamic app branding, URL, and CTA configurations.
 */
import { GET } from '../../src/app/api/v1/app-config/route';
import { AppConfigService } from '../../src/services/appConfigService';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Public App Config API (/api/v1/app-config)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with dynamic companion app config data', async () => {
    jest.spyOn(AppConfigService, 'getAppConfig').mockResolvedValueOnce({
      key: 'default',
      appName: 'GlycoSense',
      appUrl: 'https://glycosense.vercel.app',
      platformType: 'web',
      ctaText: 'Launch GlycoSense App Now',
      successTitle: 'Free Account Access Ready!',
      successMessage: 'Click below to immediately open your account. No waiting required.',
      openInNewTab: true,
      isActive: true,
    });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.appName).toBe('GlycoSense');
    expect(body.data.appUrl).toBe('https://glycosense.vercel.app');
    expect(body.data.ctaText).toBe('Launch GlycoSense App Now');
    expect(body.data.openInNewTab).toBe(true);
  });
});
