/**
 * Unit Test Suite for Admin Companion App Config API (/api/v1/admin/app-config).
 *
 * @usecase Validates that authenticated admins can retrieve and update app configuration,
 * and unauthorized requests are rejected with 401.
 */
import { GET, POST } from '../../src/app/api/v1/admin/app-config/route';
import { AppConfigService } from '../../src/services/appConfigService';
import * as adminAuth from '../../src/lib/adminAuth';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Admin Companion App Config API (/api/v1/admin/app-config)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET handler', () => {
    it('should reject unauthenticated request with 401', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(false);
      const req = new Request('http://localhost:3000/api/v1/admin/app-config');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('should return app config for authenticated admin', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(true);
      jest.spyOn(AppConfigService, 'getAppConfig').mockResolvedValueOnce({
        key: 'default',
        appName: 'GlycoSense',
        appUrl: 'https://glycosense.vercel.app',
        platformType: 'web',
        ctaText: 'Launch GlycoSense App Now',
        successTitle: 'Free Account Access Ready!',
        successMessage: 'Click below to launch your account.',
        openInNewTab: true,
        isActive: true,
      });

      const req = new Request('http://localhost:3000/api/v1/admin/app-config');
      const res = await GET(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.appName).toBe('GlycoSense');
    });
  });

  describe('POST handler', () => {
    it('should reject unauthenticated request with 401', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(false);
      const req = new Request('http://localhost:3000/api/v1/admin/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: 'MetricPace' }),
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('should return 400 if appName or appUrl is missing or invalid', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(true);
      const req = new Request('http://localhost:3000/api/v1/admin/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName: '', appUrl: '' }),
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toContain('required');
    });

    it('should update app config for valid authenticated payload', async () => {
      jest.spyOn(adminAuth, 'isAdminAuthenticated').mockResolvedValue(true);
      jest.spyOn(AppConfigService, 'updateAppConfig').mockResolvedValueOnce({
        key: 'default',
        appName: 'MetricPace',
        appUrl: 'https://play.google.com/store/apps/details?id=com.metricpace',
        platformType: 'playstore',
        ctaText: 'Download on Google Play',
        successTitle: 'Free Account Access Ready!',
        successMessage: 'Install directly to begin logging immediately.',
        openInNewTab: true,
        isActive: true,
      });

      const req = new Request('http://localhost:3000/api/v1/admin/app-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appName: 'MetricPace',
          appUrl: 'https://play.google.com/store/apps/details?id=com.metricpace',
          platformType: 'playstore',
          ctaText: 'Download on Google Play',
          successTitle: 'Free Account Access Ready!',
          successMessage: 'Install directly to begin logging immediately.',
          openInNewTab: true,
        }),
      });
      const res = await POST(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.appName).toBe('MetricPace');
      expect(body.data.platformType).toBe('playstore');
    });
  });
});
