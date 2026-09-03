/**
 * Integration & Unit Test Suite for Admin Authentication & Landing Page CMS API.
 *
 * @usecase Verifies Admin Auth, LandingPage Mongoose Model, and CRUD endpoints for owner-managed Kit landing pages.
 */
import { POST as loginAdmin } from '../../src/app/api/v1/admin/login/route';
import { GET as getLandingPages, POST as createLandingPage } from '../../src/app/api/v1/landing-pages/route';
import { LandingPageModel } from '../../src/models/LandingPage';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/LandingPage');

describe('Owner Admin Auth & Dynamic Landing Page CMS API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/admin/login', () => {
    it('should reject login with invalid credentials', async () => {
      const req = new Request('http://localhost:3000/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: 'invalid-secret' }),
      });

      const res = await loginAdmin(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Invalid admin credentials');
    });

    it('should accept login with valid secret key', async () => {
      const validSecret = process.env.API_SECRET_KEY || 'dev_secret_key_123';
      process.env.API_SECRET_KEY = validSecret;

      const req = new Request('http://localhost:3000/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: validSecret }),
      });

      const res = await loginAdmin(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Login successful');
    });
  });

  describe('POST /api/v1/landing-pages', () => {
    it('should require authentication to create a landing page', async () => {
      const req = new Request('http://localhost:3000/api/v1/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: 'subscribe', title: 'Main Optin' }),
      });

      const res = await createLandingPage(req);
      const body = await res.json();

      expect(res.status).toBe(401);
      expect(body.success).toBe(false);
    });

    it('should validate required fields (title is required)', async () => {
      const validSecret = process.env.API_SECRET_KEY || 'dev_secret_key_123';
      const req = new Request('http://localhost:3000/api/v1/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validSecret}`,
        },
        body: JSON.stringify({ slug: 'valid-slug' }),
      });

      const res = await createLandingPage(req);
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.success).toBe(false);
      expect(body.error).toContain('Title');
    });

    it('should create a landing page mapping successfully', async () => {
      const validSecret = process.env.API_SECRET_KEY || 'dev_secret_key_123';
      const mockDoc = {
        _id: 'lp_123',
        slug: 'free-cheatsheet',
        title: 'Free 7-Day Cheatsheet',
        kitScriptUrl: 'https://kit.com/123/index.js',
        embedType: 'script',
        isActive: true,
      };

      (LandingPageModel.create as jest.Mock).mockResolvedValue(mockDoc);

      const req = new Request('http://localhost:3000/api/v1/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${validSecret}`,
        },
        body: JSON.stringify({
          slug: 'free-cheatsheet',
          title: 'Free 7-Day Cheatsheet',
          kitScriptUrl: 'https://kit.com/123/index.js',
          embedType: 'script',
          isActive: true,
        }),
      });

      const res = await createLandingPage(req);
      const body = await res.json();

      expect(res.status).toBe(201);
      expect(body.success).toBe(true);
      expect(body.data.slug).toBe('free-cheatsheet');
    });
  });

  describe('GET /api/v1/landing-pages', () => {
    it('should list all active landing pages', async () => {
      const mockPages = [
        { slug: 'subscribe', title: 'Main Optin', isActive: true },
        { slug: 'cheatsheet', title: 'Cheatsheet Download', isActive: true },
      ];

      (LandingPageModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockPages),
        }),
      });

      const req = new Request('http://localhost:3000/api/v1/landing-pages', {
        method: 'GET',
      });

      const res = await getLandingPages(req);
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.data.length).toBe(2);
    });
  });
});
