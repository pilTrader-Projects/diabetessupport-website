import mongoose, { Schema, Model } from 'mongoose';
import { IDeviceSync } from '../types/community';

/**
 * Mongoose Schema definition for Temporary Device Sync Codes.
 *
 * @usecase Powers zero-password cross-device linking (e.g. mobile to desktop) with 15-minute expiring codes.
 * @dependencies mongoose, IDeviceSync domain interface.
 */
const DeviceSyncSchema = new Schema<IDeviceSync>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    authorId: {
      type: String,
      required: true,
      trim: true,
    },
    authorAlias: {
      type: String,
      required: true,
      trim: true,
    },
    authorTag: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index auto-deletes expired sync codes
    },
    claimed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const DeviceSyncModel: Model<IDeviceSync> =
  mongoose.models.DeviceSync ||
  mongoose.model<IDeviceSync>('DeviceSync', DeviceSyncSchema);
