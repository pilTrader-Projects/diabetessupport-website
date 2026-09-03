import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILandingPageDocument extends Document {
  slug: string;
  title: string;
  description?: string;
  kitFormId?: string;
  kitScriptUrl?: string;
  embedType: 'script' | 'iframe' | 'hosted';
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LandingPageSchema: Schema = new Schema<ILandingPageDocument>(
  {
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    kitFormId: {
      type: String,
      trim: true,
    },
    kitScriptUrl: {
      type: String,
      trim: true,
    },
    embedType: {
      type: String,
      enum: ['script', 'iframe', 'hosted'],
      default: 'script',
    },
    metaTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
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

export const LandingPageModel: Model<ILandingPageDocument> =
  mongoose.models.LandingPage ||
  mongoose.model<ILandingPageDocument>('LandingPage', LandingPageSchema);
