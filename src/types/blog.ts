export type PostStatus = 'draft' | 'published' | 'archived';

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

export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: Date;
}

export interface IApiKey {
  _id?: string;
  key: string;
  name: string;
  active: boolean;
  createdAt?: Date;
}
