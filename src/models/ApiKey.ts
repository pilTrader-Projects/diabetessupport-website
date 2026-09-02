import mongoose, { Schema, Model } from 'mongoose';
import { IApiKey } from '../types/blog';

/**
 * Mongoose Schema definition for Automation API Authentication Keys.
 *
 * @usecase Authenticates external AI content generators submitting automated blog posts.
 * @dependencies mongoose, IApiKey domain interface.
 */
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

/**
 * Exported Mongoose ApiKey Model instance.
 *
 * @usecase Provides query interface to validate API keys on incoming POST requests.
 * @dependencies mongoose.models, ApiKeySchema.
 * @returns {Model<IApiKey>} Compiled or cached Mongoose Model for ApiKey documents.
 */
export const ApiKeyModel: Model<IApiKey> =
  mongoose.models.ApiKey || mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
