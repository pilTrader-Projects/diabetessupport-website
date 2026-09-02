import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { IPost } from '@/types/blog';
import Link from 'next/link';

export const revalidate = 60; // Revalidate static cache every 60 seconds

/**
 * Blog Article Feed Index Page Server Component.
 *
 * @usecase Displays list of published diabetes health awareness articles imported from MongoDB.
 * @param None Server component receives searchParams or no props.
 * @dependencies dbConnect, PostModel, IPost interface.
 * @returns {Promise<JSX.Element>} Rendered blog article feed grid.
 */
export default async function BlogFeedPage() {
  await dbConnect();
  const rawPosts = await PostModel.find({ status: 'published' })
    .sort({ publishedAt: -1 })
    .lean();

  const posts: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id.toString(),
    category: doc.category?.toString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
    createdAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt) : undefined,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Blog Feed Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200">
          📚 Educational Resource Hub
        </span>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          Diabetes Health & Prevention Articles
        </h1>
        <p className="text-lg text-slate-600">
          Evidence-based guides on understanding insulin resistance, blood sugar metrics, and lifestyle interventions.
        </p>
      </div>

      {/* Article Grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-base">No published articles found yet. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post._id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-teal-300 transition-all"
            >
              <div className="space-y-4 p-6">
                {post.featuredImage && (
                  <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Article'}
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 line-clamp-2 hover:text-teal-600">
                    <Link href={`/blog/${post.slug}`}>{post.title.replace(/&nbsp;/g, ' ')}</Link>
                  </h2>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
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
    </div>
  );
}
