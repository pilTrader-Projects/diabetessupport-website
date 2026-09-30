import mongoose, { Schema, Model } from 'mongoose';
import { IAuthority } from '../types/learning';

/**
 * Mongoose Schema definition for Monitored Authorities & Personalities.
 *
 * @usecase Stores reputable medical doctors, scientists, and researchers whose channels and publications are tracked.
 * @dependencies mongoose, IAuthority domain interface.
 */
const AuthoritySchema = new Schema<IAuthority>(
  {
    name: {
      type: String,
      required: [true, 'Authority name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Authority slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: [true, 'Authority title/credential is required'],
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    aliases: {
      type: [String],
      default: [],
    },
    specialties: {
      type: [String],
      default: [],
    },
    youtubeChannelId: {
      type: String,
      trim: true,
    },
    podcastKeywords: {
      type: String,
      trim: true,
    },
    pubMedQuery: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    socialUrl: {
      type: String,
      trim: true,
    },
    autoPublish: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    lastSyncAt: {
      type: Date,
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

// Hot-reload guard: if an older model was cached without recommendedBooks, invalidate it
if (mongoose.models.Authority && !(mongoose.models.Authority.schema.path('recommendedBooks'))) {
  delete (mongoose.models as any).Authority;
}

export const AuthorityModel: Model<IAuthority> =
  mongoose.models.Authority || mongoose.model<IAuthority>('Authority', AuthoritySchema);
