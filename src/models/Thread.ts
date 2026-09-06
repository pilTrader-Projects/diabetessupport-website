import mongoose, { Schema, Model } from 'mongoose';
import { IThread } from '../types/community';

/**
 * Mongoose Schema definition for Community Discussion Threads.
 *
 * @usecase Defines database fields, unique slug index, moderation status, and engagement counters for community topics.
 * @dependencies mongoose, IThread domain interface.
 */
const ThreadSchema = new Schema<IThread>(
  {
    title: {
      type: String,
      required: [true, 'Thread title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Thread slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Thread content is required'],
      maxlength: [10000, 'Content cannot exceed 10,000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'General Support',
      trim: true,
      index: true,
    },
    authorAlias: {
      type: String,
      required: [true, 'Author alias is required'],
      default: 'Community Member',
      trim: true,
      maxlength: [50, 'Alias cannot exceed 50 characters'],
    },
    authorTag: {
      type: String,
      required: true,
      default: '#1001',
      trim: true,
    },
    authorId: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    authorEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    notifyOnReply: {
      type: Boolean,
      default: false,
    },
    authorEditTokenHash: {
      type: String,
      select: false,
    },
    status: {
      type: String,
      enum: ['published', 'flagged', 'pending_review', 'archived'],
      default: 'published',
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    repliesCount: {
      type: Number,
      default: 0,
    },
    pinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const ThreadModel: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>('Thread', ThreadSchema);
