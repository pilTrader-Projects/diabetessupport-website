import mongoose, { Schema, Model } from 'mongoose';
import { ILearningResource } from '../types/learning';

/**
 * Mongoose Schema definition for Learning Resources (Videos, Studies, Articles, Podcasts).
 *
 * @usecase Catalog of evidence-based materials from authorities, displayed on /blog learning hub.
 * @dependencies mongoose, ILearningResource domain interface.
 */
const LearningResourceSchema = new Schema<ILearningResource>(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Resource slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    type: {
      type: String,
      enum: ['video', 'podcast', 'study', 'article'],
      required: true,
      index: true,
    },
    authorityId: {
      type: Schema.Types.ObjectId,
      ref: 'Authority',
      index: true,
    },
    authorityName: {
      type: String,
      required: [true, 'Authority name is required'],
      trim: true,
    },
    authorityTitle: {
      type: String,
      trim: true,
    },
    authorityAvatar: {
      type: String,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    keyTakeaways: {
      type: [String],
      default: [],
    },
    sourceUrl: {
      type: String,
      required: [true, 'Source URL is required'],
      trim: true,
    },
    platform: {
      type: String,
      enum: ['youtube', 'spotify', 'pubmed', 'web', 'apple-podcasts'],
      default: 'web',
      index: true,
    },
    embedId: {
      type: String,
      trim: true,
      index: true,
    },
    thumbnailUrl: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    topics: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ['published', 'pending_review', 'archived', 'broken_link'],
      default: 'published',
      index: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    saveCount: {
      type: Number,
      default: 0,
    },
    lastValidatedAt: {
      type: Date,
    },
    validationStatus: {
      type: String,
      enum: ['healthy', 'broken', 'redirected', 'unverified'],
      default: 'unverified',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LearningResourceModel: Model<ILearningResource> =
  mongoose.models.LearningResource ||
  mongoose.model<ILearningResource>('LearningResource', LearningResourceSchema);
