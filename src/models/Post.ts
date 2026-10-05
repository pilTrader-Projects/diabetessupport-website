import mongoose, { Schema, Model } from 'mongoose';
import { IPost } from '../types/blog';

/**
 * Mongoose Schema definition for Blog Posts.
 *
 * @usecase Defines fields, data types, indexes, and validation rules for blog articles.
 * @dependencies mongoose, IPost domain interface.
 */
const PostSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Post slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
    },
    featuredImage: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    seoTitle: {
      type: String,
      trim: true,
    },
    metaDescription: {
      type: String,
      trim: true,
    },
    wordpressId: {
      type: Number,
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Exported Mongoose Post Model instance.
 *
 * @usecase Provides CRUD interface for MongoDB blog posts collection.
 * @dependencies mongoose.models, PostSchema.
 * @returns {Model<IPost>} Compiled or cached Mongoose Model for Post documents.
 */
export const PostModel: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);
