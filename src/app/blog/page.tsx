import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { AuthorityModel } from '@/models/Authority';
import { LearningResourceModel } from '@/models/LearningResource';
import { getCategoryLookupMap, resolveCategoryName } from '@/lib/categoryUtils';
import { IPost } from '@/types/blog';
import { IAuthority, ILearningResource } from '@/types/learning';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';
import LearningHubClient from '@/components/learning/LearningHubClient';

export const revalidate = 60; // Revalidate static cache every 60 seconds

export const metadata: Metadata = {
  title: `Learning Materials & Evidence Hub | ${SITE_CONFIG.title}`,
  description:
    'Comprehensive library of reputable medical sources, videos, and clinical trials on Low Carb, Intermittent Fasting, and Natural Metabolic Healing.',
  openGraph: {
    title: `Metabolic Health Learning Materials & Evidence Hub | ${SITE_CONFIG.domain}`,
    description: SITE_CONFIG.description,
    url: `https://${SITE_CONFIG.domain}/blog`,
    siteName: SITE_CONFIG.title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Metabolic Health Learning Materials & Evidence Hub | ${SITE_CONFIG.domain}`,
    description: SITE_CONFIG.description,
  },
  alternates: {
    types: {
      'application/rss+xml': `https://${SITE_CONFIG.domain}/feed.xml`,
    },
  },
};

interface BlogFeedPageProps {
  searchParams?: Promise<{ category?: string; search?: string }>;
}

/**
 * Learning Materials & Evidence Hub Directory Index Page.
 *
 * @usecase Unified repository of curated videos, clinical trials, and editorial articles on metabolic health.
 * @dependencies dbConnect, PostModel, AuthorityModel, LearningResourceModel.
 */
export default async function BlogFeedPage({ searchParams }: BlogFeedPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeCategory = resolvedParams.category || 'All';
  const searchQuery = (resolvedParams.search || '').trim();

  let rawPosts: any[] = [];
  let rawAuthorities: any[] = [];
  let rawResources: any[] = [];
  let categoryMap: Map<string, string> = new Map();

  try {
    await dbConnect();
    categoryMap = await getCategoryLookupMap();

    // Fetch published editorial articles
    rawPosts = await PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .lean();

    // Fetch active authorities
    rawAuthorities = await AuthorityModel.find({ isActive: true })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    // Fetch published learning resources
    rawResources = await LearningResourceModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .lean();
  } catch (err) {
    console.error('Error fetching learning hub data for BlogFeedPage:', err);
  }

  const allPosts: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    category: resolveCategoryName(doc.category, categoryMap),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  const allAuthorities: IAuthority[] = rawAuthorities.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    lastSyncAt: doc.lastSyncAt ? new Date(doc.lastSyncAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  const allResources: ILearningResource[] = rawResources.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    authorityId: doc.authorityId ? doc.authorityId.toString() : undefined,
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <LearningHubClient
        initialAuthorities={allAuthorities}
        initialResources={allResources}
        initialArticles={allPosts}
        initialSearch={searchQuery}
        initialTopic={activeCategory}
      />

      {/* RSS & Sitemap Links Footer Banner */}
      <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span>DiabetesCare PH Educational Campaign &amp; Learning Hub</span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200"
          >
            📡 RSS Feed (/feed.xml)
          </a>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200"
          >
            🗺️ XML Sitemap (/sitemap.xml)
          </a>
        </div>
      </div>
    </div>
  );
}
