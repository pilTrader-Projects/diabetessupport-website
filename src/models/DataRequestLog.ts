import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDataRequestLogDetails {
  consentRecordsFound?: number;
  leadsFound?: number;
  tokensFound?: number;
  threadsFound?: number;
  repliesFound?: number;
  consentRecordsDeleted?: number;
  leadsDeleted?: number;
  tokensDeleted?: number;
  threadsAnonymized?: number;
  repliesAnonymized?: number;
  brevoContactFound?: boolean;
  brevoDeleted?: boolean;
  brevoStatus?: string;
  error?: string;
  [key: string]: any;
}

export interface IDataRequestLogDocument extends Document {
  emailHash: string;
  action: 'export' | 'delete';
  requestedAt: Date;
  status: 'success' | 'partial' | 'failed';
  details: IDataRequestLogDetails;
  operator: string;
  createdAt: Date;
  updatedAt: Date;
}

const DataRequestLogSchema: Schema = new Schema<IDataRequestLogDocument>(
  {
    emailHash: {
      type: String,
      required: [true, 'SHA-256 email hash is required for auditable proof'],
      index: true,
      trim: true,
    },
    action: {
      type: String,
      enum: ['export', 'delete'],
      required: [true, 'Data request action is required'],
      index: true,
    },
    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ['success', 'partial', 'failed'],
      default: 'success',
      index: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    operator: {
      type: String,
      default: 'cli_admin',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for historical queries
DataRequestLogSchema.index({ emailHash: 1, action: 1 });

export const DataRequestLogModel: Model<IDataRequestLogDocument> =
  mongoose.models.DataRequestLog ||
  mongoose.model<IDataRequestLogDocument>('DataRequestLog', DataRequestLogSchema);
