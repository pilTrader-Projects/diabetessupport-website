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
    podcastChannelId: {
      type: Schema.Types.ObjectId,
      ref: 'PodcastChannel',
      index: true,
    },
    podcastChannelName: {
      type: String,
      trim: true,
      index: true,
    },
    isGuestAppearance: {
      type: Boolean,
      default: false,
      index: true,
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
      enum: ['published', 'pending_review', 'rejected', 'archived', 'broken_link'],
      default: 'published',
      index: true,
    },
    relevanceScore: {
      type: Number,
      default: 0,
      index: true,
    },
    relevanceReason: {
      type: String,
      trim: true,
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
    recommendedBooks: {
      type: [
        new Schema(
          {
            title: { type: String, required: true, trim: true },
            author: { type: String, required: true, trim: true },
            authoritySlug: { type: String, trim: true },
            type: { type: String, enum: ['book', 'program', 'protocol'], default: 'book' },
            subtitle: { type: String, trim: true },
            description: { type: String, trim: true },
            affiliateUrl: { type: String, required: true, trim: true },
            coverUrl: { type: String, trim: true },
            badgeText: { type: String, trim: true },
            platformName: { type: String, default: 'Amazon', trim: true },
            topics: { type: [String], default: [] },
          },
          { _id: true }
        ),
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Hot-reload guard: if an older model was cached in-memory without the 'rejected' status enum or 'recommendedBooks', invalidate it
if (
  mongoose.models.LearningResource &&
  (!(mongoose.models.LearningResource.schema.path('status') as any)?.enumValues?.includes('rejected') ||
   !mongoose.models.LearningResource.schema.path('recommendedBooks'))
) {
  delete (mongoose.models as any).LearningResource;
}

export const LearningResourceModel: Model<ILearningResource> =
  mongoose.models.LearningResource ||
  mongoose.model<ILearningResource>('LearningResource', LearningResourceSchema);
