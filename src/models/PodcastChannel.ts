import mongoose, { Schema, Model } from 'mongoose';
import { IPodcastChannel } from '../types/learning';

/**
 * Mongoose Schema definition for Monitored Podcast Channels (e.g., The Diary Of A CEO, Joe Rogan Experience).
 *
 * @usecase Catalog of official podcast shows tracked by the automation cron to syndicate guest appearances of authorities.
 * @dependencies mongoose, IPodcastChannel domain interface.
 */
const PodcastChannelSchema = new Schema<IPodcastChannel>(
  {
    name: {
      type: String,
      required: [true, 'Podcast show name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Podcast show slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    host: {
      type: String,
      trim: true,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    youtubeChannelId: {
      type: String,
      trim: true,
    },
    spotifyShowId: {
      type: String,
      trim: true,
    },
    applePodcastsUrl: {
      type: String,
      trim: true,
    },
    websiteUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    autoPublish: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    lastSyncAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const PodcastChannelModel: Model<IPodcastChannel> =
  mongoose.models.PodcastChannel ||
  mongoose.model<IPodcastChannel>('PodcastChannel', PodcastChannelSchema);
