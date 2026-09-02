/**
 * Represents the publication status of a blog post.
 * @usecase Restricts status field values across CMS and API logic.
 */
export type PostStatus = 'draft' | 'published' | 'archived';

/**
 * Domain entity interface for Blog Post documents.
 *
 * @usecase Provides strict TypeScript types for blog articles across backend controllers and frontend UI components.
 * @dependencies PostStatus type definition.
 */
export interface IPost {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  category?: string;
  tags?: string[];
  status: PostStatus;
  seoTitle?: string;
  metaDescription?: string;
  wordpressId?: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain entity interface for Blog Categories.
 *
 * @usecase Defines category grouping metadata for navigation and article taxonomy.
 */
export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
}

/**
 * Domain entity interface for API Authentication Keys.
 *
 * @usecase Strongly types API Key credentials for external automation scripts.
 */
export interface IApiKey {
  _id?: string;
  key: string;
  name: string;
  active: boolean;
  createdAt?: Date;
}
