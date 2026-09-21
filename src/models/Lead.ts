import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeadDocument extends Document {
  email: string;
  firstName?: string;
  source: string;
  symptomsChecked?: string[];
  status: 'pending' | 'subscribed' | 'unsubscribed';
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema: Schema = new Schema<ILeadDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      default: 'insulin_reset_protocol',
      trim: true,
      index: true,
    },
    symptomsChecked: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'subscribed', 'unsubscribed'],
      default: 'subscribed',
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeadModel: Model<ILeadDocument> =
  mongoose.models.Lead || mongoose.model<ILeadDocument>('Lead', LeadSchema);
