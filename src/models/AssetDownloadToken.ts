import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing a secure tokenized download link for a digital asset.
 */
export interface IAssetDownloadTokenDocument extends Document {
  token: string;
  fileId: mongoose.Types.ObjectId;
  fileName: string;
  contentType: string;
  maxDownloads: number;
  downloadCount: number;
  expiresAt: Date;
  isActive: boolean;
  lastDownloadedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssetDownloadTokenSchema: Schema = new Schema<IAssetDownloadTokenDocument>(
  {
    token: {
      type: String,
      required: [true, 'Security token is required'],
      unique: true,
      trim: true,
      index: true,
    },
    fileId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Referenced GridFS file ID is required'],
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    contentType: {
      type: String,
      default: 'application/pdf',
      trim: true,
    },
    maxDownloads: {
      type: Number,
      default: 3,
      min: [1, 'Maximum downloads must be at least 1'],
    },
    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastDownloadedAt: {
      type: Date,
    },
    createdBy: {
      type: String,
      default: 'admin',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AssetDownloadTokenModel: Model<IAssetDownloadTokenDocument> =
  mongoose.models.AssetDownloadToken ||
  mongoose.model<IAssetDownloadTokenDocument>(
    'AssetDownloadToken',
    AssetDownloadTokenSchema
  );
