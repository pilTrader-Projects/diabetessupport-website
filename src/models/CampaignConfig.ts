import mongoose, { Schema, Document, Model } from 'mongoose';
import { METABOLIC_STAGES } from '@/config/leadConfig';

/**
 * Interface representing a Campaign Configuration document for dynamic lead routing and Brevo list assignment.
 */
export interface ICampaignConfigDocument extends Document {
  referenceCode: string;
  name: string;
  brevoList: string;
  defaultMetabolicStage: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CampaignConfigSchema: Schema = new Schema<ICampaignConfigDocument>(
  {
    referenceCode: {
      type: String,
      required: [true, 'Reference code is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    brevoList: {
      type: String,
      required: [true, 'Target Brevo list identifier is required'],
      trim: true,
    },
    defaultMetabolicStage: {
      type: String,
      required: [true, 'Default metabolic stage is required'],
      trim: true,
      uppercase: true,
      default: METABOLIC_STAGES.GENERAL_AWARENESS,
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const CampaignConfigModel: Model<ICampaignConfigDocument> =
  mongoose.models.CampaignConfig ||
  mongoose.model<ICampaignConfigDocument>('CampaignConfig', CampaignConfigSchema);
