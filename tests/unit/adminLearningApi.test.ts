/**
 * TDD Unit Test Suite for Admin & Public Learning API Routes.
 *
 * @usecase Tests auth security, CRUD operations, sync trigger, and public resource queries.
 */
import { GET as getAuthorities, POST as postAuthority } from '../../src/app/api/v1/admin/learning/authorities/route';
import { PUT as putAuthority, DELETE as deleteAuthority } from '../../src/app/api/v1/admin/learning/authorities/[id]/route';
import { POST as postSync } from '../../src/app/api/v1/admin/learning/sync/route';
import { POST as postValidate } from '../../src/app/api/v1/admin/learning/validate/route';
import { GET as getAdminResources, POST as postAdminResource } from '../../src/app/api/v1/admin/learning/resources/route';
import { PUT as putAdminResource, DELETE as deleteAdminResource } from '../../src/app/api/v1/admin/learning/resources/[id]/route';
import { GET as getPublicResources } from '../../src/app/api/v1/learning/resources/route';
import { GET as getPublicAuthorities } from '../../src/app/api/v1/learning/authorities/route';
import { isAdminAuthenticated } from '../../src/lib/adminAuth';
import { LearningService } from '../../src/services/learningService';

jest.mock('../../src/lib/adminAuth', () => ({
  isAdminAuthenticated: jest.fn(),
}));

jest.mock('../../src/services/learningService');

describe('Learning API Routes (TDD Unit Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Admin Authorities API', () => {
    it('GET /api/v1/admin/learning/authorities returns 401 when not authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(false);
      const res = await getAuthorities();
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/admin/learning/authorities returns 200 with authorities when authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.listAuthorities as jest.Mock).mockResolvedValueOnce([
        { _id: '1', name: 'Dr. Benjamin Bikman' },
      ]);

      const res = await getAuthorities();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
    });

    it('POST /api/v1/admin/learning/authorities creates authority', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.createAuthority as jest.Mock).mockResolvedValueOnce({
        _id: 'new_1',
        name: 'Dr. Jason Fung',
      });

      const req = new Request('http://localhost/api/v1/admin/learning/authorities', {
        method: 'POST',
        body: JSON.stringify({ name: 'Dr. Jason Fung', title: 'Nephrologist' }),
      });

      const res = await postAuthority(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.name).toBe('Dr. Jason Fung');
    });

    it('PUT /api/v1/admin/learning/authorities/[id] updates authority', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.updateAuthority as jest.Mock).mockResolvedValueOnce({
        _id: 'auth_1',
        name: 'Dr. Bikman Updated',
      });

      const req = new Request('http://localhost/api/v1/admin/learning/authorities/auth_1', {
        method: 'PUT',
        body: JSON.stringify({ name: 'Dr. Bikman Updated' }),
      });

      const res = await putAuthority(req, { params: Promise.resolve({ id: 'auth_1' }) });
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.name).toBe('Dr. Bikman Updated');
    });

    it('DELETE /api/v1/admin/learning/authorities/[id] deletes authority', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.deleteAuthority as jest.Mock).mockResolvedValueOnce(true);

      const res = await deleteAuthority(new Request('http://localhost'), {
        params: Promise.resolve({ id: 'auth_1' }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Admin Sync & Validate Triggers', () => {
    it('POST /api/v1/admin/learning/sync triggers sync of all active authorities', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.syncAllActiveAuthorities as jest.Mock).mockResolvedValueOnce({
        totalAdded: 3,
        details: [],
      });

      const req = new Request('http://localhost/api/v1/admin/learning/sync', { method: 'POST' });
      const res = await postSync(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.totalAdded).toBe(3);
    });

    it('POST /api/v1/admin/learning/validate triggers link-rot check', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.runLinkRotHealthCheck as jest.Mock).mockResolvedValueOnce({
        checked: 10,
        broken: 0,
        updated: [],
      });

      const res = await postValidate();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.checked).toBe(10);
    });
  });

  describe('Admin Resources Moderation API', () => {
    it('GET /api/v1/admin/learning/resources returns resources list', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.listResources as jest.Mock).mockResolvedValueOnce({
        resources: [{ _id: 'res_1', title: 'Video 1' }],
        total: 1,
      });

      const req = new Request('http://localhost/api/v1/admin/learning/resources');
      const res = await getAdminResources(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.resources).toHaveLength(1);
    });

    it('POST /api/v1/admin/learning/resources creates resource manually', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.createResource as jest.Mock).mockResolvedValueOnce({
        _id: 'new_res',
        title: 'New Video Lecture',
      });

      const req = new Request('http://localhost/api/v1/admin/learning/resources', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New Video Lecture',
          type: 'video',
          sourceUrl: 'https://youtube.com/watch?v=123',
          authorityName: 'Dr. Bikman',
          summary: 'Summary',
        }),
      });

      const res = await postAdminResource(req);
      expect(res.status).toBe(201);
    });

    it('PUT /api/v1/admin/learning/resources/[id] updates resource', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.updateResource as jest.Mock).mockResolvedValueOnce({
        _id: 'res_1',
        status: 'published',
      });

      const req = new Request('http://localhost/api/v1/admin/learning/resources/res_1', {
        method: 'PUT',
        body: JSON.stringify({ status: 'published' }),
      });

      const res = await putAdminResource(req, { params: Promise.resolve({ id: 'res_1' }) });
      expect(res.status).toBe(200);
    });

    it('DELETE /api/v1/admin/learning/resources/[id] deletes resource', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (LearningService.deleteResource as jest.Mock).mockResolvedValueOnce(true);

      const res = await deleteAdminResource(new Request('http://localhost'), {
        params: Promise.resolve({ id: 'res_1' }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Public Learning API', () => {
    it('GET /api/v1/learning/resources returns published resources with filters', async () => {
      (LearningService.listResources as jest.Mock).mockResolvedValueOnce({
        resources: [{ _id: 'pub_1', title: 'Public Resource', status: 'published' }],
        total: 1,
      });

      const req = new Request('http://localhost/api/v1/learning/resources?type=video&topic=Low%20Carb');
      const res = await getPublicResources(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.resources).toHaveLength(1);
      expect(LearningService.listResources).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'published', type: 'video', topic: 'Low Carb' })
      );
    });

    it('GET /api/v1/learning/authorities returns active authorities for public filter bar', async () => {
      (LearningService.listAuthorities as jest.Mock).mockResolvedValueOnce([
        { _id: 'auth_1', name: 'Dr. Benjamin Bikman', isActive: true },
      ]);

      const res = await getPublicAuthorities();
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data).toHaveLength(1);
      expect(LearningService.listAuthorities).toHaveBeenCalledWith({ activeOnly: true });
    });
  });
});
