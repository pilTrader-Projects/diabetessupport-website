/**
 * Community Discussion Moderation Status.
 * @usecase Defines lifecycle status for threads and replies.
 */
export type CommunityStatus = 'published' | 'flagged' | 'pending_review' | 'archived';

/**
 * Domain entity interface for Community Discussion Threads.
 *
 * @usecase Strongly types discussion topic documents across API endpoints, database queries, and forum UI.
 */
export interface IThread {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  authorAlias: string;
  authorTag: string;
  authorId: string;
  authorEmail?: string;
  notifyOnReply?: boolean;
  authorEditTokenHash?: string;
  status: CommunityStatus;
  reportCount: number;
  views: number;
  repliesCount: number;
  pinned?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain entity interface for Community Thread Replies.
 *
 * @usecase Strongly types individual response messages posted to discussion threads.
 */
export interface IReply {
  _id?: string;
  threadId: string;
  content: string;
  authorAlias: string;
  authorTag: string;
  authorId: string;
  authorEmail?: string;
  authorEditTokenHash?: string;
  isOp: boolean;
  status: CommunityStatus;
  reportCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Temporary Device Sync Code entity.
 *
 * @usecase Facilitates zero-password cross-device author identification linking.
 */
export interface IDeviceSync {
  _id?: string;
  code: string;
  authorId: string;
  authorAlias: string;
  authorTag: string;
  expiresAt: Date;
  claimed: boolean;
  createdAt?: Date;
}
