import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { AuthorityModel } from '@/models/Authority';
import { PodcastChannelModel } from '@/models/PodcastChannel';
import { LearningResourceModel } from '@/models/LearningResource';
import { getCategoryLookupMap, resolveCategoryName } from '@/lib/categoryUtils';
import { IPost } from '@/types/blog';
import { IAuthority, ILearningResource, IPodcastChannel } from '@/types/learning';
import { Metadata } from 'next';
import mongoose from 'mongoose';
import { SITE_CONFIG } from '@/config/constants';
import LearningHubClient from '@/components/learning/LearningHubClient';
import { getRecommendedBooksForAuthority } from '@/config/affiliateBooks';

export const revalidate = 60; // Revalidate static cache every 60 seconds

interface BlogFeedPageProps {
  searchParams?: Promise<{
    category?: string;
    search?: string;
    format?: string;
    authority?: string;
    podcast?: string;
    resource?: string;
  }>;
}

export async function generateMetadata({ searchParams }: BlogFeedPageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {};
  const baseUrl = `https://${SITE_CONFIG.domain}`;

  // If a specific learning resource is being shared, dynamically return its title, summary, and photo thumbnail
  if (resolvedParams.resource) {
    try {
      await dbConnect();
      const isObjectId = mongoose.Types.ObjectId.isValid(resolvedParams.resource);
      let resource: any = await LearningResourceModel.findOne({
        $or: [
          { slug: resolvedParams.resource },
          { embedId: resolvedParams.resource },
          ...(isObjectId ? [{ _id: resolvedParams.resource }] : []),
        ],
      }).lean();

      if (!resource) {
        const post = await PostModel.findOne({
          $or: [
            { slug: resolvedParams.resource },
            ...(isObjectId ? [{ _id: resolvedParams.resource }] : []),
          ],
        }).lean();
        if (post) {
          resource = {
            title: post.title,
            summary: post.excerpt,
            slug: post.slug,
            thumbnailUrl: post.featuredImage,
          };
        }
      }

      if (resource) {
        const cleanTitle = `${(resource.title || '').replace(/&nbsp;/g, ' ')} | ${SITE_CONFIG.title}`;
        const cleanDesc = resource.summary || 'Evidence-based metabolic health lecture and research.';
        const shareUrl = `${baseUrl}/learn?resource=${encodeURIComponent(resource.slug || resolvedParams.resource)}`;
        let imageUrl = resource.thumbnailUrl || `${baseUrl}/icons/icon-512x512.png`;
        if (imageUrl.startsWith('/')) {
          imageUrl = `${baseUrl}${imageUrl}`;
        }

        return {
          title: cleanTitle,
          description: cleanDesc,
          alternates: {
            canonical: `/learn?resource=${encodeURIComponent(resource.slug || resolvedParams.resource)}`,
          },
          openGraph: {
            title: cleanTitle,
            description: cleanDesc,
            url: shareUrl,
            siteName: SITE_CONFIG.title,
            type: 'video.other',
            images: [
              {
                url: imageUrl,
                width: 1280,
                height: 720,
                alt: resource.title,
              },
            ],
          },
          twitter: {
            card: 'summary_large_image',
            title: cleanTitle,
            description: cleanDesc,
            images: [imageUrl],
          },
        };
      }
    } catch (err) {
      console.error('Error generating dynamic metadata for resource share:', err);
    }
  }

  return {
    title: `Learning Materials & Evidence Hub | ${SITE_CONFIG.title}`,
    description:
      'Comprehensive library of reputable medical sources, videos, and clinical trials on Low Carb, Intermittent Fasting, and Natural Metabolic Healing.',
    openGraph: {
      title: `Metabolic Health Learning Materials & Evidence Hub | ${SITE_CONFIG.domain}`,
      description: SITE_CONFIG.description,
      url: `${baseUrl}/learn`,
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
        'application/rss+xml': `${baseUrl}/feed.xml`,
      },
    },
  };
}

/**
 * Learning Materials & Evidence Hub Directory Index Page.
 *
 * @usecase Unified repository of curated videos, clinical trials, and editorial articles on metabolic health.
 * @dependencies dbConnect, PostModel, AuthorityModel, PodcastChannelModel, LearningResourceModel.
 */
export default async function BlogFeedPage({ searchParams }: BlogFeedPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeCategory = resolvedParams.category || 'All';
  const searchQuery = (resolvedParams.search || '').trim();
  const formatQuery = (resolvedParams.format || 'all').toLowerCase();
  const authorityQuery = (resolvedParams.authority || 'all').trim();
  const podcastQuery = (resolvedParams.podcast || 'all').trim();
  const resourceQuery = (resolvedParams.resource || resolvedParams.play || '').trim();

  let rawPosts: any[] = [];
  let rawAuthorities: any[] = [];
  let rawPodcastChannels: any[] = [];
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

    // Fetch active monitored podcast channels
    rawPodcastChannels = await PodcastChannelModel.find({ isActive: true })
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
    recommendedBooks:
      doc.recommendedBooks && doc.recommendedBooks.length > 0
        ? doc.recommendedBooks
        : getRecommendedBooksForAuthority(doc.slug || doc.name),
    lastSyncAt: doc.lastSyncAt ? new Date(doc.lastSyncAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  const allPodcastChannels: IPodcastChannel[] = rawPodcastChannels.map((doc: any) => ({
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
    podcastChannelId: doc.podcastChannelId ? doc.podcastChannelId.toString() : undefined,
    recommendedBooks: doc.recommendedBooks || [],
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      <LearningHubClient
        initialAuthorities={allAuthorities}
        initialPodcastChannels={allPodcastChannels}
        initialResources={allResources}
        initialArticles={allPosts}
        initialSearch={searchQuery}
        initialTopic={activeCategory}
        initialFormat={['all', 'video', 'podcast', 'article', 'study', 'book'].includes(formatQuery) ? (formatQuery as any) : 'all'}
        initialAuthority={authorityQuery}
        initialPodcast={podcastQuery}
        initialResourceSlug={resourceQuery}
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
