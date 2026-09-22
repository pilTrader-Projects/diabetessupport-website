/**
 * TDD Unit Test Suite for AssetDownloadToken Model and AssetStorageService.
 *
 * @usecase Validates token creation, default quotas, expiration logic, and GridFS integration.
 */
import mongoose from 'mongoose';
import { AssetDownloadTokenModel } from '../../src/models/AssetDownloadToken';
import { AssetStorageService } from '../../src/services/assetStorageService';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

describe('Digital Assets & Tokenized Downloads (TDD Unit Tests)', () => {
  beforeEach(() => {
    (mongoose.connection as any).readyState = 1;
    (mongoose.connection as any).db = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AssetDownloadTokenModel Schema Validation', () => {
    it('should validate a complete and valid download token document', async () => {
      const mockFileId = new mongoose.Types.ObjectId();
      const expiresAt = new Date(Date.now() + 48 * 3600 * 1000);

      const tokenDoc = new AssetDownloadTokenModel({
        token: 'sec_abcdef1234567890',
        fileId: mockFileId,
        fileName: 'Insulin_Reset_Cheat_Sheet.pdf',
        contentType: 'application/pdf',
        maxDownloads: 3,
        downloadCount: 0,
        expiresAt,
        isActive: true,
      });

      const err = await tokenDoc.validate().catch((e) => e);
      expect(err).toBeUndefined();
      expect(tokenDoc.token).toBe('sec_abcdef1234567890');
      expect(tokenDoc.maxDownloads).toBe(3);
      expect(tokenDoc.downloadCount).toBe(0);
      expect(tokenDoc.isActive).toBe(true);
    });

    it('should require token, fileId, fileName, and expiresAt', async () => {
      const invalidDoc = new AssetDownloadTokenModel({});
      const err = await invalidDoc.validate().catch((e) => e);

      expect(err).toBeDefined();
      expect(err.errors.token).toBeDefined();
      expect(err.errors.fileId).toBeDefined();
      expect(err.errors.fileName).toBeDefined();
      expect(err.errors.expiresAt).toBeDefined();
    });

    it('should reject maxDownloads less than 1', async () => {
      const mockFileId = new mongoose.Types.ObjectId();
      const invalidDoc = new AssetDownloadTokenModel({
        token: 'sec_test_invalid_quota',
        fileId: mockFileId,
        fileName: 'guide.pdf',
        maxDownloads: 0,
        expiresAt: new Date(),
      });

      const err = await invalidDoc.validate().catch((e) => e);
      expect(err).toBeDefined();
      expect(err.errors.maxDownloads).toBeDefined();
    });
  });

  describe('AssetStorageService.generateDownloadToken()', () => {
    it('should generate a token starting with "sec_" and default to 48 hours and 3 downloads', async () => {
      const mockFileId = new mongoose.Types.ObjectId();
      const mockFile = {
        _id: mockFileId,
        filename: 'Meal_Plan_7_Days.pdf',
        contentType: 'application/pdf',
      };

      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([mockFile]),
        }),
      });

      jest.spyOn(AssetStorageService, 'getBucket').mockResolvedValue({
        find: mockFind,
      } as any);

      jest.spyOn(AssetDownloadTokenModel, 'create').mockImplementation(async (data: any) => ({
        ...data,
        _id: new mongoose.Types.ObjectId(),
      }));

      const tokenDoc = await AssetStorageService.generateDownloadToken({
        fileId: mockFileId.toString(),
      });

      expect(tokenDoc).not.toBeNull();
      expect(tokenDoc!.token).toMatch(/^sec_[a-f0-9]{48}$/);
      expect(tokenDoc!.maxDownloads).toBe(3);
      expect(tokenDoc!.downloadCount).toBe(0);
      expect(tokenDoc!.isActive).toBe(true);
      expect(tokenDoc!.fileName).toBe('Meal_Plan_7_Days.pdf');

      const hoursDifference =
        (tokenDoc!.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      expect(Math.round(hoursDifference)).toBe(48);
    });

    it('should return null if the requested asset does not exist in GridFS', async () => {
      const mockFileId = new mongoose.Types.ObjectId();
      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });

      jest.spyOn(AssetStorageService, 'getBucket').mockResolvedValue({
        find: mockFind,
      } as any);

      const tokenDoc = await AssetStorageService.generateDownloadToken({
        fileId: mockFileId.toString(),
      });
      expect(tokenDoc).toBeNull();
    });

    it('should generate a token when querying by fileName', async () => {
      const mockFileId = new mongoose.Types.ObjectId();
      const mockFile = {
        _id: mockFileId,
        filename: 'insulin_reset_cheat_sheet.pdf',
        contentType: 'application/pdf',
      };

      const mockFind = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([mockFile]),
        }),
      });

      jest.spyOn(AssetStorageService, 'getBucket').mockResolvedValue({
        find: mockFind,
      } as any);

      jest.spyOn(AssetDownloadTokenModel, 'create').mockImplementation(async (data: any) => ({
        ...data,
        _id: new mongoose.Types.ObjectId(),
      }));

      const tokenDoc = await AssetStorageService.generateDownloadToken({
        fileName: 'insulin_reset_cheat_sheet.pdf',
      });
      expect(tokenDoc).toBeDefined();
      expect(tokenDoc?.fileName).toBe('insulin_reset_cheat_sheet.pdf');
    });
  });
});
