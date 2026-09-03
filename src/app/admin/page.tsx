import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { LandingPageModel } from '@/models/LandingPage';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0; // Dynamic admin dashboard

/**
 * Owner Admin Dashboard Overview Hub (/admin).
 *
 * @usecase Displays platform analytics overview, published content counts, and quick navigation links.
 * @dependencies isAdminAuthenticated, PostModel, LandingPageModel.
 * @returns {Promise<JSX.Element>} Rendered admin dashboard.
 */
export default async function AdminDashboardPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  await dbConnect();
  const totalPosts = await PostModel.countDocuments();
  const publishedPosts = await PostModel.countDocuments({ status: 'published' });
  const totalLandingPages = await LandingPageModel.countDocuments();
  const activeLandingPages = await LandingPageModel.countDocuments({ isActive: true });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-xs font-black uppercase tracking-widest text-teal-400">Owner CMS Control Center</span>
          <h1 className="text-3xl font-black text-white">Platform Dashboard</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            🌐 View Public Site
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Blog Posts</div>
          <div className="text-3xl font-extrabold text-white">{totalPosts}</div>
          <div className="text-xs text-teal-400 font-semibold">{publishedPosts} Published Articles</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Custom Landing Pages</div>
          <div className="text-3xl font-extrabold text-white">{totalLandingPages}</div>
          <div className="text-xs text-amber-400 font-semibold">{activeLandingPages} Active Kit Slugs</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Publishing API</div>
          <div className="text-3xl font-extrabold text-teal-400">Active</div>
          <div className="text-xs text-slate-400 font-semibold">POST /api/v1/posts</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">SEO Feeds</div>
          <div className="text-3xl font-extrabold text-teal-400">Live</div>
          <div className="text-xs text-slate-400 font-semibold">sitemap.xml & feed.xml</div>
        </div>
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kit Landing Pages Management Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-teal-700 transition-all">
          <div className="space-y-3">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl font-bold text-white">Kit Landing Pages & Slugs</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Create and manage custom website URLs (e.g. <code className="bg-slate-950 px-2 py-0.5 rounded text-teal-300">/subscribe</code>, <code className="bg-slate-950 px-2 py-0.5 rounded text-teal-300">/cheatsheet</code>) mapped directly to your Kit (ConvertKit) forms and lead capture embeds.
            </p>
          </div>

          <Link
            href="/admin/landing-pages"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-sm py-3.5 rounded-xl shadow-lg transition-colors text-center inline-block"
          >
            Manage Kit Landing Pages &rarr;
          </Link>
        </div>

        {/* Blog Post Articles Management Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between hover:border-teal-700 transition-all">
          <div className="space-y-3">
            <span className="text-3xl">✍️</span>
            <h2 className="text-2xl font-bold text-white">Blog Article CMS</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              View, edit, or publish educational health articles, manage categories, and modify featured images visually.
            </p>
          </div>

          <Link
            href="/admin/posts"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-sm py-3.5 rounded-xl border border-slate-700 transition-colors text-center inline-block"
          >
            Manage Blog Articles &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
