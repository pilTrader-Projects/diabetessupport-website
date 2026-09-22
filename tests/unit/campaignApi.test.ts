/**
 * TDD Unit Test Suite for Admin Campaigns API Route (/api/v1/admin/campaigns).
 *
 * @usecase Validates GET and POST endpoints for managing dynamic Brevo campaign configurations.
 * @dependencies GET and POST handlers from src/app/api/v1/admin/campaigns/route.ts.
 */
import { GET, POST } from '../../src/app/api/v1/admin/campaigns/route';
import { isAdminAuthenticated } from '../../src/lib/adminAuth';
import { CampaignService } from '../../src/services/campaignService';
import { CampaignConfigModel } from '../../src/models/CampaignConfig';

jest.mock('../../src/lib/adminAuth', () => ({
  isAdminAuthenticated: jest.fn(),
}));

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Admin Campaigns API (/api/v1/admin/campaigns)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/admin/campaigns', () => {
    it('should return 401 Unauthorized if admin is not authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(false);

      const req = new Request('http://localhost:3000/api/v1/admin/campaigns');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toContain('Unauthorized');
    });

    it('should return all configured campaigns when authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      jest.spyOn(CampaignService, 'getAllCampaigns').mockResolvedValueOnce([
        {
          referenceCode: 'newsletter',
          name: 'Newsletter Subscription',
          brevoList: 'subscribed_contacts',
          defaultMetabolicStage: 'GENERAL_AWARENESS',
          isActive: true,
        },
      ]);

      const req = new Request('http://localhost:3000/api/v1/admin/campaigns');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].referenceCode).toBe('newsletter');
    });
  });

  describe('POST /api/v1/admin/campaigns', () => {
    it('should return 401 Unauthorized if admin is not authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(false);

      const req = new Request('http://localhost:3000/api/v1/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: 'test' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should return 400 Bad Request if mandatory fields are missing', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);

      const req = new Request('http://localhost:3000/api/v1/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceCode: 'test' }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    it('should upsert campaign configuration successfully', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      jest.spyOn(CampaignConfigModel, 'findOneAndUpdate').mockResolvedValueOnce({
        referenceCode: 'companion_app_users',
        name: 'GlycoSense Companion App Claim',
        brevoList: 'companion_app_users',
        defaultMetabolicStage: 'COMPANION_APP_USER',
        isActive: true,
      } as any);

      const req = new Request('http://localhost:3000/api/v1/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceCode: 'companion_app_users',
          name: 'GlycoSense Companion App Claim',
          brevoList: 'companion_app_users',
          defaultMetabolicStage: 'COMPANION_APP_USER',
          isActive: true,
        }),
      });
      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.referenceCode).toBe('companion_app_users');
    });
  });
});
