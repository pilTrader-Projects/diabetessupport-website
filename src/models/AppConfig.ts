import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Interface representing Companion App Configuration for external app links and rebranding.
 *
 * @usecase Decouples companion app destination (Web PWA, PlayStore, AppStore) and brand naming
 * from static code, allowing live admin updates without redeployment.
 */
export interface IAppConfigDocument extends Document {
  key: string;
  appName: string;
  appUrl: string;
  platformType: 'web' | 'playstore' | 'appstore' | 'custom';
  ctaText: string;
  successTitle: string;
  successMessage: string;
  openInNewTab: boolean;
  isActive: boolean;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppConfigSchema: Schema = new Schema<IAppConfigDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'default',
      trim: true,
      index: true,
    },
    appName: {
      type: String,
      required: [true, 'App brand name is required'],
      trim: true,
      default: 'GlycoSense',
    },
    appUrl: {
      type: String,
      required: [true, 'Destination App URL is required'],
      trim: true,
      default: 'https://glycosense.vercel.app',
    },
    platformType: {
      type: String,
      enum: ['web', 'playstore', 'appstore', 'custom'],
      default: 'web',
    },
    ctaText: {
      type: String,
      required: [true, 'Action button text is required'],
      trim: true,
      default: 'Launch GlycoSense App Now',
    },
    successTitle: {
      type: String,
      required: [true, 'Success headline is required'],
      trim: true,
      default: 'Free Account Access Ready!',
    },
    successMessage: {
      type: String,
      required: [true, 'Success instruction message is required'],
      trim: true,
      default: 'Click below to immediately open your account. No waiting required.',
    },
    openInNewTab: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.AppConfig) {
  delete (mongoose.models as any).AppConfig;
}

export const AppConfigModel: Model<IAppConfigDocument> =
  mongoose.models.AppConfig ||
  mongoose.model<IAppConfigDocument>('AppConfig', AppConfigSchema);
