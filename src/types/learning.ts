/**
 * Domain entity types for Learning Materials, Curated Resources & Monitored Authorities.
 *
 * @usecase Powers the dynamic Learning Materials & Evidence Hub (/blog) and Admin Management.
 */

export type ResourceType = 'video' | 'podcast' | 'study' | 'article';
export type ResourcePlatform = 'youtube' | 'spotify' | 'pubmed' | 'web' | 'apple-podcasts';
export type ResourceStatus = 'published' | 'pending_review' | 'rejected' | 'archived' | 'broken_link';
export type ValidationStatus = 'healthy' | 'broken' | 'redirected' | 'unverified';

/**
 * Result of AI advocacy relevance qualification.
 */
export interface IRelevanceQualification {
  isRelevant: boolean;
  relevanceScore: number;        // 0-100 relevance score
  relevanceReason: string;       // Clinical/advocacy explanation of qualification decision
  matchedTopics: string[];       // Curated topics mapped to our advocacy taxonomy
  suggestedTakeaways: string[];  // 3-point clinical takeaway bullets for metabolic health
}

/**
 * Domain interface for Authorities & Personalities monitored by the ingestion engine.
 */
export interface IAuthority {
  _id?: string;
  name: string;
  slug: string;
  title: string;                 // e.g. "Professor of Cell Biology & Physiology, BYU"
  avatarUrl?: string;
  bio?: string;
  specialties: string[];         // e.g. ["Insulin Resistance", "Ketosis", "Autophagy"]
  
  // Monitoring Feeds (Admin Configured)
  youtubeChannelId?: string;     // e.g., UC... or @username
  podcastKeywords?: string;      // e.g., "Benjamin Bikman" podcast
  pubMedQuery?: string;          // e.g., "Bikman B[Author]"
  websiteUrl?: string;
  socialUrl?: string;

  // Automation flags
  autoPublish: boolean;          // If true, new ingested items go live immediately
  isActive: boolean;             // If false, paused from automated sync
  displayOrder: number;          // Visual sorting for authority filter bar
  lastSyncAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Domain interface for Learning Resources (Videos, Studies, Articles, Podcasts).
 */
export interface ILearningResource {
  _id?: string;
  title: string;
  slug: string;
  type: ResourceType;
  
  // Authority attribution
  authorityId?: string;
  authorityName: string;
  authorityTitle?: string;
  authorityAvatar?: string;

  summary: string;
  keyTakeaways: string[];        // 3-5 bullet points for rapid 10-second consumption

  // Media & Platform details
  sourceUrl: string;             // Direct URL on YouTube, PubMed, Spotify, etc.
  platform: ResourcePlatform;
  embedId?: string;              // e.g., YouTube Video ID for responsive player
  thumbnailUrl?: string;
  duration?: string;             // e.g., "24:15" or "12 min read"

  // Taxonomy & Search
  topics: string[];              // e.g. ["Low Carb", "Intermittent Fasting", "Autophagy"]
  
  // Moderation & Health Status
  status: ResourceStatus;
  relevanceScore?: number;       // 0-100 score from AI qualification engine
  relevanceReason?: string;      // Rationale explaining qualification or disqualification
  viewCount?: number;
  saveCount?: number;
  lastValidatedAt?: Date;
  validationStatus?: ValidationStatus;

  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
