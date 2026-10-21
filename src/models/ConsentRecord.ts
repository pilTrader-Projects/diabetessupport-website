import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConsentRecordDocument extends Document {
  email: string;
  source: string;
  edition: string;
  noticeVersion: string;
  consentedAt: Date;
  ipHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentRecordSchema: Schema = new Schema<IConsentRecordDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    source: {
      type: String,
      required: [true, 'Campaign source is required'],
      trim: true,
      index: true,
    },
    edition: {
      type: String,
      default: 'ph',
      trim: true,
      index: true,
    },
    noticeVersion: {
      type: String,
      default: '2026.1',
      trim: true,
    },
    consentedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipHash: {
      type: String,
      required: [true, 'IP hash is required for auditable proof of consent'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup by email and source
ConsentRecordSchema.index({ email: 1, source: 1 });

export const ConsentRecordModel: Model<IConsentRecordDocument> =
  mongoose.models.ConsentRecord ||
  mongoose.model<IConsentRecordDocument>('ConsentRecord', ConsentRecordSchema);
