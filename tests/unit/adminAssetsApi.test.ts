/**
 * TDD Unit Test Suite for Admin Digital Assets Endpoints.
 *
 * @usecase Tests authentication, upload, deletion, and link token generation in admin routes.
 */
import { GET as getAssets, POST as postAsset } from '../../src/app/api/v1/admin/assets/route';
import { DELETE as deleteAsset } from '../../src/app/api/v1/admin/assets/[id]/route';
import { POST as postToken } from '../../src/app/api/v1/admin/assets/[id]/tokens/route';
import { isAdminAuthenticated } from '../../src/lib/adminAuth';
import { AssetStorageService } from '../../src/services/assetStorageService';
import mongoose from 'mongoose';

jest.mock('../../src/lib/adminAuth', () => ({
  isAdminAuthenticated: jest.fn(),
}));

jest.mock('../../src/services/assetStorageService');

describe('Admin Digital Assets API Routes (TDD Unit Tests)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/admin/assets', () => {
    it('should return 401 when admin is not authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(false);

      const res = await getAssets();
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
    });

    it('should return 200 with list of digital assets when authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (AssetStorageService.listAssets as jest.Mock).mockResolvedValueOnce([
        {
          id: 'mock_id_1',
          fileName: 'Test_Guide.pdf',
          contentType: 'application/pdf',
          length: 1024,
          uploadDate: new Date(),
          activeTokensCount: 1,
          totalDownloads: 5,
        },
      ]);

      const res = await getAssets();
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].fileName).toBe('Test_Guide.pdf');
    });
  });

  describe('POST /api/v1/admin/assets (Upload)', () => {
    it('should return 401 when not authenticated', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(false);

      const req = new Request('http://localhost:3000/api/v1/admin/assets', {
        method: 'POST',
      });
      const res = await postAsset(req);
      expect(res.status).toBe(401);
    });

    it('should return 400 when no file is included in FormData', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);

      const formData = new FormData();
      const req = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any;

      const res = await postAsset(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('valid file');
    });

    it('should successfully upload file buffer to GridFS', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);

      const fakeFile = new File(['dummy pdf content'], 'Sample_Guide.pdf', {
        type: 'application/pdf',
      });
      const formData = new FormData();
      formData.append('file', fakeFile);

      const req = {
        formData: jest.fn().mockResolvedValue(formData),
      } as any;

      (AssetStorageService.uploadAsset as jest.Mock).mockResolvedValueOnce({
        id: 'uploaded_id_123',
        fileName: 'Sample_Guide.pdf',
        contentType: 'application/pdf',
        length: 18,
        uploadDate: new Date(),
      });

      const res = await postAsset(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.fileName).toBe('Sample_Guide.pdf');
    });
  });

  describe('DELETE /api/v1/admin/assets/[id]', () => {
    it('should delete asset and return success', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);
      (AssetStorageService.deleteAsset as jest.Mock).mockResolvedValueOnce(true);

      const req = new Request('http://localhost:3000/api/v1/admin/assets/123', {
        method: 'DELETE',
      });
      const context = { params: Promise.resolve({ id: '123' }) };

      const res = await deleteAsset(req, context);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/v1/admin/assets/[id]/tokens', () => {
    it('should generate a token and return the full download URL', async () => {
      (isAdminAuthenticated as jest.Mock).mockResolvedValueOnce(true);

      const mockTokenDoc = {
        token: 'sec_test_token_123',
        fileId: new mongoose.Types.ObjectId(),
        fileName: 'Guide.pdf',
        maxDownloads: 3,
        expiresAt: new Date(),
      };

      (AssetStorageService.generateDownloadToken as jest.Mock).mockResolvedValueOnce(
        mockTokenDoc
      );

      const req = new Request('http://localhost:3000/api/v1/admin/assets/123/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresInHours: 48, maxDownloads: 3 }),
      });
      const context = { params: Promise.resolve({ id: '123' }) };

      const res = await postToken(req, context);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.downloadUrl).toContain('/api/v1/assets/download?token=sec_test_token_123');
    });
  });
});
