import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { CategoryModel } from '@/models/Category';
import { getCategoryLookupMap, resolveCategoryName } from '@/lib/categoryUtils';
import { IPost } from '@/types/blog';
import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const revalidate = 60; // Revalidate static cache every 60 seconds

export const metadata: Metadata = {
  title: `Articles & Educational Guides | ${SITE_CONFIG.title}`,
  description:
    'Explore evidence-based articles on understanding diabetes, insulin resistance, blood sugar management, and lifestyle prevention.',
  openGraph: {
    title: `Diabetes Care & Awareness Articles | ${SITE_CONFIG.domain}`,
    description: SITE_CONFIG.description,
    url: `https://${SITE_CONFIG.domain}/blog`,
    siteName: SITE_CONFIG.title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Diabetes Care & Awareness Articles | ${SITE_CONFIG.domain}`,
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
 * Blog Article Directory Index Page with Category Filter & Search Navigation.
 *
 * @usecase Displays filterable list of published diabetes health articles with category pills and search navigation.
 * @param {BlogFeedPageProps} props Server page props receiving async searchParams.
 * @dependencies dbConnect, PostModel, CategoryModel, IPost interface.
 * @returns {Promise<JSX.Element>} Rendered blog article directory.
 */
export default async function BlogFeedPage({ searchParams }: BlogFeedPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const activeCategory = resolvedParams.category || 'All';
  const searchQuery = (resolvedParams.search || '').trim();

  let rawPosts: any[] = [];
  let categoryMap: Map<string, string> = new Map();
  try {
    await dbConnect();
    categoryMap = await getCategoryLookupMap();

    // Fetch all published posts
    rawPosts = await PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .lean();
  } catch (err) {
    console.error('Error fetching posts for BlogFeedPage:', err);
  }

  const allPosts: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    category: resolveCategoryName(doc.category, categoryMap),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  // Build category counts
  const categoryCounts: Record<string, number> = { All: allPosts.length };
  allPosts.forEach((post) => {
    const cat = post.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Unique sorted list of categories
  const categories = ['All', ...Object.keys(categoryCounts).filter((c) => c !== 'All').sort()];

  // Filter posts based on category and search query
  const filteredPosts = allPosts.filter((post) => {
    const matchesCategory =
      activeCategory === 'All' ||
      post.category?.toLowerCase() === activeCategory.toLowerCase();

    const matchesSearch =
      !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (post.tags && post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Blog Feed Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200 inline-flex items-center gap-1.5">
          <span>📚</span> Educational Resource Hub
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Diabetes Health & Prevention Articles
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Evidence-based guides on understanding insulin resistance, blood sugar metrics, and lifestyle interventions.
        </p>

        {/* Search Bar */}
        <form method="GET" action="/blog" className="pt-4 max-w-xl mx-auto flex gap-2">
          {activeCategory !== 'All' && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <div className="relative flex-1">
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search articles by topic, keyword, or tag..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 border-b border-slate-200 pb-6">
        {categories.map((cat) => {
          const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
          const count = categoryCounts[cat] || 0;
          const href =
            cat === 'All'
              ? searchQuery
                ? `/blog?search=${encodeURIComponent(searchQuery)}`
                : '/blog'
              : searchQuery
              ? `/blog?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(searchQuery)}`
              : `/blog?category=${encodeURIComponent(cat)}`;

          return (
            <Link
              key={cat}
              href={href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all inline-flex items-center gap-2 ${
                isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Search & Filter Status Header */}
      {(activeCategory !== 'All' || searchQuery) && (
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-6 py-3.5 rounded-xl">
          <div className="text-sm text-slate-700">
            Showing results for{' '}
            {activeCategory !== 'All' && (
              <span className="font-bold text-teal-800">Category: {activeCategory}</span>
            )}
            {activeCategory !== 'All' && searchQuery && ' • '}
            {searchQuery && (
              <span className="font-bold text-slate-900">Query: &quot;{searchQuery}&quot;</span>
            )}
          </div>
          <Link
            href="/blog"
            className="text-xs font-bold text-teal-700 hover:text-teal-900 underline"
          >
            Clear Filters ✕
          </Link>
        </div>
      )}

      {/* Article Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <p className="text-slate-600 text-base font-medium">No published articles found matching your query.</p>
          <p className="text-slate-400 text-sm">Try searching for different keywords or select a different category.</p>
          <div>
            <Link
              href="/blog"
              className="inline-block mt-2 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-800"
            >
              Reset All Filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all"
            >
              <div className="space-y-4 p-6">
                {post.featuredImage ? (
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-xl bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center text-teal-700 text-3xl font-extrabold border border-teal-100">
                    🩺 DiabetesCare
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100">
                      {post.category || 'General'}
                    </span>
                    <span className="font-semibold text-slate-400">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Article'}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 line-clamp-2 hover:text-teal-600 pt-1">
                    <Link href={`/blog/${post.slug}`}>{post.title.replace(/&nbsp;/g, ' ')}</Link>
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-bold text-teal-700 hover:text-teal-900 group"
                >
                  Read Full Article <span className="ml-1 group-hover:translate-x-1 transition-transform">&rarr;</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* RSS & Sitemap Links Footer Banner */}
      <div className="border-t border-slate-200 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          <span>DiabetesCare PH Educational Campaign Engine</span>
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
