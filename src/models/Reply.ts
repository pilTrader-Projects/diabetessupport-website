import mongoose, { Schema, Model } from 'mongoose';
import { IReply } from '../types/community';

/**
 * Mongoose Schema definition for Community Thread Replies.
 *
 * @usecase Defines database fields, parent thread index, author metadata, and OP status for discussion comments.
 * @dependencies mongoose, IReply domain interface.
 */
const ReplySchema = new Schema<IReply>(
  {
    threadId: {
      type: String,
      required: [true, 'Thread ID is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Reply content is required'],
      maxlength: [5000, 'Reply content cannot exceed 5,000 characters'],
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
    authorEditTokenHash: {
      type: String,
      select: false,
    },
    isOp: {
      type: Boolean,
      default: false,
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
  },
  {
    timestamps: true,
  }
);

export const ReplyModel: Model<IReply> =
  mongoose.models.Reply || mongoose.model<IReply>('Reply', ReplySchema);

export const Reply = ReplyModel;
export default ReplyModel;
