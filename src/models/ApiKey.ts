import mongoose, { Schema, Model } from 'mongoose';
import { IApiKey } from '../types/blog';

const ApiKeySchema = new Schema<IApiKey>(
  {
    key: {
      type: String,
      required: [true, 'API key string is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'API key owner/service name is required'],
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const ApiKeyModel: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
