import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { CampaignConfigModel } from '@/models/CampaignConfig';
import { LeadModel } from '@/models/Lead';
import { AssetStorageService } from '@/services/assetStorageService';
import { AppConfigService } from '@/services/appConfigService';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0; // Dynamic admin dashboard

/**
 * Owner Admin Dashboard Overview Hub (/admin).
 *
 * @usecase Displays platform analytics overview, published content counts, and quick navigation links.
 * @dependencies isAdminAuthenticated, PostModel, CampaignConfigModel, LeadModel, AssetStorageService, AppConfigService.
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
  const totalCampaigns = await CampaignConfigModel.countDocuments();
  const activeCampaigns = await CampaignConfigModel.countDocuments({ isActive: true });
  const totalLeads = await LeadModel.countDocuments();
  const appConfig = await AppConfigService.getAppConfig();

  let totalAssets = 0;
  try {
    const assets = await AssetStorageService.listAssets();
    totalAssets = assets.length;
  } catch (err) {
    console.error('Error counting assets:', err);
  }

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
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Brevo Campaigns</div>
          <div className="text-3xl font-extrabold text-white">{totalCampaigns}</div>
          <div className="text-xs text-amber-400 font-semibold">{activeCampaigns} Active Funnels</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Captured Leads</div>
          <div className="text-3xl font-extrabold text-teal-400">{totalLeads}</div>
          <div className="text-xs text-slate-400 font-semibold">Synced to Brevo</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Companion App</div>
          <div className="text-2xl font-extrabold text-teal-400 truncate" title={appConfig.appName}>
            {appConfig.appName}
          </div>
          <div className="text-xs text-slate-400 font-semibold uppercase">
            {appConfig.platformType} • {appConfig.isActive ? 'Active' : 'Paused'}
          </div>
        </div>
      </div>

      {/* Management Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Companion App Integration Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-teal-700 transition-all shadow-xl">
          <div className="space-y-3">
            <span className="text-3xl">📱</span>
            <h2 className="text-xl font-bold text-white">Companion App Integration</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically manage external app destination URLs (PWA, Google Play, Apple App Store), brand naming, and immediate access redirection for subscribers.
            </p>
          </div>

          <Link
            href="/admin/app-settings"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-colors text-center inline-block"
          >
            Configure App Links &rarr;
          </Link>
        </div>

        {/* Brevo Campaigns Management Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-teal-700 transition-all shadow-xl">
          <div className="space-y-3">
            <span className="text-3xl">📧</span>
            <h2 className="text-xl font-bold text-white">Brevo Campaigns &amp; Lead Lists</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dynamically map lead capture reference codes to Brevo contact lists and metabolic stages without code edits.
            </p>
          </div>

          <Link
            href="/admin/campaigns"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-colors text-center inline-block"
          >
            Configure Campaigns &rarr;
          </Link>
        </div>

        {/* Digital Assets Management Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-teal-700 transition-all shadow-xl">
          <div className="space-y-3">
            <span className="text-3xl">📦</span>
            <h2 className="text-xl font-bold text-white">Digital Assets &amp; Downloads</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Store lead magnet PDFs in MongoDB GridFS and generate secured, tokenized links with expiration and quotas ({totalAssets} uploaded).
            </p>
          </div>

          <Link
            href="/admin/assets"
            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs py-3.5 rounded-xl shadow-lg transition-colors text-center inline-block"
          >
            Manage Assets &rarr;
          </Link>
        </div>

        {/* Blog Post Articles Management Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 flex flex-col justify-between hover:border-teal-700 transition-all shadow-xl">
          <div className="space-y-3">
            <span className="text-3xl">✍️</span>
            <h2 className="text-xl font-bold text-white">Blog Article CMS</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              View, edit, or publish educational health articles, manage categories, and modify featured images visually.
            </p>
          </div>

          <Link
            href="/admin/posts"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs py-3.5 rounded-xl border border-slate-700 transition-colors text-center inline-block"
          >
            Manage Blog Articles &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

