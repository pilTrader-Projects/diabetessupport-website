import mongoose from 'mongoose';
import crypto from 'crypto';
import { dbConnect } from '@/lib/dbConnect';
import { AssetDownloadTokenModel } from '@/models/AssetDownloadToken';

export const ASSET_BUCKET_NAME = 'digital_assets';

export interface UploadAssetResult {
  id: string;
  fileName: string;
  contentType: string;
  length: number;
  uploadDate: Date;
}

export interface StoredAssetSummary {
  id: string;
  fileName: string;
  contentType: string;
  length: number;
  uploadDate: Date;
  activeTokensCount: number;
  totalDownloads: number;
}

/**
 * Service managing digital asset storage in MongoDB GridFS and tokenized access.
 *
 * @usecase Streams digital assets to/from MongoDB GridFS and manages secured download tokens.
 * @dependencies mongoose.mongo.GridFSBucket, dbConnect, AssetDownloadTokenModel.
 */
export class AssetStorageService {
  /**
   * Initializes and returns the MongoDB GridFS bucket instance.
   */
  public static async getBucket(): Promise<mongoose.mongo.GridFSBucket> {
    await dbConnect();
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established.');
    }
    return new mongoose.mongo.GridFSBucket(db, {
      bucketName: ASSET_BUCKET_NAME,
    });
  }

  /**
   * Uploads an asset buffer to MongoDB GridFS.
   */
  public static async uploadAsset(
    buffer: Buffer,
    fileName: string,
    contentType = 'application/pdf'
  ): Promise<UploadAssetResult> {
    const bucket = await this.getBucket();
    const cleanFileName = fileName.trim().replace(/[^a-zA-Z0-9._-]/g, '_');

    return new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(cleanFileName, {
        metadata: { contentType, originalName: fileName },
      });

      uploadStream.on('error', (err) => reject(err));
      uploadStream.on('finish', () => {
        resolve({
          id: uploadStream.id.toString(),
          fileName: cleanFileName,
          contentType,
          length: buffer.length,
          uploadDate: new Date(),
        });
      });

      uploadStream.end(buffer);
    });
  }

  /**
   * Retrieves a readable download stream and metadata for a given GridFS file ID.
   */
  public static async getAssetStream(fileId: string) {
    const bucket = await this.getBucket();
    const objectId = new mongoose.Types.ObjectId(fileId);

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      return null;
    }

    const fileDoc = files[0];
    const stream = bucket.openDownloadStream(objectId);

    return {
      stream,
      file: {
        id: fileDoc._id.toString(),
        fileName: fileDoc.filename,
        contentType:
          (fileDoc as any).metadata?.contentType ||
          (fileDoc as any).contentType ||
          'application/pdf',
        length: fileDoc.length,
      },
    };
  }

  /**
   * Deletes an asset from GridFS and cleans up all associated download tokens.
   */
  public static async deleteAsset(fileId: string): Promise<boolean> {
    const bucket = await this.getBucket();
    const objectId = new mongoose.Types.ObjectId(fileId);

    try {
      await bucket.delete(objectId);
    } catch (err: any) {
      if (!err.message?.includes('FileNotFound')) {
        throw err;
      }
    }

    await AssetDownloadTokenModel.deleteMany({ fileId: objectId });
    return true;
  }

  /**
   * Lists all uploaded assets in GridFS alongside their download token statistics.
   */
  public static async listAssets(): Promise<StoredAssetSummary[]> {
    const bucket = await this.getBucket();
    const files = await bucket.find({}).sort({ uploadDate: -1 }).toArray();

    const assets: StoredAssetSummary[] = [];

    for (const file of files) {
      const tokens = await AssetDownloadTokenModel.find({ fileId: file._id }).lean();
      const activeCount = tokens.filter(
        (t) => t.isActive && new Date(t.expiresAt) > new Date() && t.downloadCount < t.maxDownloads
      ).length;
      const totalDownloads = tokens.reduce((sum, t) => sum + (t.downloadCount || 0), 0);

      assets.push({
        id: file._id.toString(),
        fileName: file.filename,
        contentType:
          (file as any).metadata?.contentType ||
          (file as any).contentType ||
          'application/pdf',
        length: file.length,
        uploadDate: file.uploadDate,
        activeTokensCount: activeCount,
        totalDownloads,
      });
    }

    return assets;
  }

  /**
   * Generates a cryptographically secure, time-expiring, quota-limited download token.
   */
  public static async generateDownloadToken(params: {
    fileId: string;
    maxDownloads?: number;
    expiresInHours?: number;
    createdBy?: string;
  }) {
    await dbConnect();
    const bucket = await this.getBucket();
    const objectId = new mongoose.Types.ObjectId(params.fileId);

    const files = await bucket.find({ _id: objectId }).toArray();
    if (!files || files.length === 0) {
      throw new Error('Digital asset not found.');
    }

    const file = files[0];
    const rawToken = crypto.randomBytes(24).toString('hex');
    const token = `sec_${rawToken}`;
    const hours = params.expiresInHours && params.expiresInHours > 0 ? params.expiresInHours : 48;
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    return await AssetDownloadTokenModel.create({
      token,
      fileId: objectId,
      fileName: file.filename,
      contentType: (file as any).contentType || 'application/pdf',
      maxDownloads: params.maxDownloads && params.maxDownloads > 0 ? params.maxDownloads : 3,
      downloadCount: 0,
      expiresAt,
      isActive: true,
      createdBy: params.createdBy || 'admin',
    });
  }
}
