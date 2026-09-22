/**
 * TDD Unit Test Suite for Secured Digital Asset Download Endpoint.
 *
 * @usecase Tests token validation, expiration, download quotas, revocation, and binary streaming.
 */
import { GET } from '../../src/app/api/v1/assets/download/route';
import { AssetDownloadTokenModel } from '../../src/models/AssetDownloadToken';
import { AssetStorageService } from '../../src/services/assetStorageService';
import { Readable } from 'stream';
import mongoose from 'mongoose';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('GET /api/v1/assets/download Endpoint', () => {
  beforeEach(() => {
    (mongoose.connection as any).readyState = 1;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 when no token is provided', async () => {
    const req = new Request('http://localhost:3000/api/v1/assets/download');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain('Missing Security Token');
  });

  it('should return 404 when token does not exist', async () => {
    jest.spyOn(AssetDownloadTokenModel, 'findOne').mockResolvedValueOnce(null);

    const req = new Request('http://localhost:3000/api/v1/assets/download?token=sec_nonexistent');
    const res = await GET(req);

    expect(res.status).toBe(404);
    const text = await res.text();
    expect(text).toContain('Invalid Download Link');
  });

  it('should return 403 when token has been revoked (isActive: false)', async () => {
    jest.spyOn(AssetDownloadTokenModel, 'findOne').mockResolvedValueOnce({
      token: 'sec_revoked_token',
      isActive: false,
    } as any);

    const req = new Request('http://localhost:3000/api/v1/assets/download?token=sec_revoked_token');
    const res = await GET(req);

    expect(res.status).toBe(403);
    const text = await res.text();
    expect(text).toContain('Link Revoked');
  });

  it('should return 410 when token has expired', async () => {
    const pastDate = new Date(Date.now() - 3600 * 1000);
    jest.spyOn(AssetDownloadTokenModel, 'findOne').mockResolvedValueOnce({
      token: 'sec_expired_token',
      isActive: true,
      expiresAt: pastDate,
      maxDownloads: 3,
      downloadCount: 0,
    } as any);

    const req = new Request('http://localhost:3000/api/v1/assets/download?token=sec_expired_token');
    const res = await GET(req);

    expect(res.status).toBe(410);
    const text = await res.text();
    expect(text).toContain('Link Expired');
  });

  it('should return 410 when download quota has been reached', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    jest.spyOn(AssetDownloadTokenModel, 'findOne').mockResolvedValueOnce({
      token: 'sec_quota_token',
      isActive: true,
      expiresAt: futureDate,
      maxDownloads: 3,
      downloadCount: 3,
    } as any);

    const req = new Request('http://localhost:3000/api/v1/assets/download?token=sec_quota_token');
    const res = await GET(req);

    expect(res.status).toBe(410);
    const text = await res.text();
    expect(text).toContain('Download Quota Exceeded');
  });

  it('should successfully stream file and increment download count when token is valid', async () => {
    const futureDate = new Date(Date.now() + 3600 * 1000);
    const mockFileId = new mongoose.Types.ObjectId();
    const saveMock = jest.fn().mockResolvedValue(true);

    const mockTokenDoc = {
      token: 'sec_valid_token',
      fileId: mockFileId,
      isActive: true,
      expiresAt: futureDate,
      maxDownloads: 3,
      downloadCount: 1,
      lastDownloadedAt: undefined,
      save: saveMock,
    };

    jest.spyOn(AssetDownloadTokenModel, 'findOne').mockResolvedValueOnce(mockTokenDoc as any);

    const readableNodeStream = Readable.from(['fake pdf binary content']);
    jest.spyOn(AssetStorageService, 'getAssetStream').mockResolvedValueOnce({
      stream: readableNodeStream as any,
      file: {
        id: mockFileId.toString(),
        fileName: 'Insulin_Reset_Guide.pdf',
        contentType: 'application/pdf',
        length: 24,
      },
    });

    const req = new Request('http://localhost:3000/api/v1/assets/download?token=sec_valid_token');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');
    expect(res.headers.get('Content-Disposition')).toContain('Insulin_Reset_Guide.pdf');
    expect(mockTokenDoc.downloadCount).toBe(2);
    expect(mockTokenDoc.lastDownloadedAt).toBeDefined();
    expect(saveMock).toHaveBeenCalled();
  });
});
