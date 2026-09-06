import { Metadata } from 'next';
import { dbConnect } from '@/lib/dbConnect';
import { ThreadModel } from '@/models/Thread';
import { IThread } from '@/types/community';
import CommunityFeedClient from '@/components/community/CommunityFeedClient';
import { SITE_CONFIG } from '@/config/constants';

export const revalidate = 30; // Revalidate dynamic forum feed every 30s

export const metadata: Metadata = {
  title: 'Diabetes Community Board & Peer Discussions | DiabetesCare PH',
  description:
    'Join Filipino family providers and patients sharing practical blood sugar tracking experiences, low-GI Filipino recipes, and daily lifestyle tips.',
  alternates: {
    canonical: '/community',
  },
  openGraph: {
    title: 'Diabetes Community Board & Peer Discussions | DiabetesCare PH',
    description:
      'Join Filipino family providers and patients sharing practical blood sugar tracking experiences, low-GI Filipino recipes, and daily lifestyle tips.',
    url: `https://${SITE_CONFIG.domain}/community`,
    type: 'website',
  },
};

interface CommunityPageProps {
  searchParams?: Promise<{ category?: string; search?: string; page?: string }>;
}

/**
 * Community Discussion Forum Directory Index Server Page.
 *
 * @usecase Server-rendered community topic hub with category filter and search parameters.
 * @dependencies dbConnect, ThreadModel, CommunityFeedClient.
 * @param {CommunityPageProps} props Route search parameters.
 * @returns {Promise<JSX.Element>} Rendered community feed page.
 */
export default async function CommunityPage({ searchParams }: CommunityPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeCategory = resolvedParams.category || 'All';
  const searchQuery = (resolvedParams.search || '').trim();
  const page = Math.max(1, parseInt(resolvedParams.page || '1', 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  let rawThreads: any[] = [];
  let total = 0;

  try {
    await dbConnect();
    const query: any = { status: 'published' };
    if (activeCategory !== 'All') {
      query.category = activeCategory;
    }
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { content: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    [rawThreads, total] = await Promise.all([
      ThreadModel.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThreadModel.countDocuments(query),
    ]);
  } catch (error) {
    console.error('Error loading community topics:', error);
  }

  const threads: IThread[] = rawThreads.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <CommunityFeedClient
        threads={threads}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        total={total}
        page={page}
        totalPages={Math.ceil(total / limit) || 1}
      />
    </div>
  );
}
