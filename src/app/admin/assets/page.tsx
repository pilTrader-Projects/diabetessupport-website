import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { AssetStorageService } from '@/services/assetStorageService';
import AssetsManagerClient from '@/components/admin/AssetsManagerClient';

export const metadata: Metadata = {
  title: 'Digital Assets & Secured Downloads | DiabetesCare PH Admin',
  robots: 'noindex, nofollow',
};

/**
 * Server-rendered Admin Digital Assets Manager Page (/admin/assets).
 *
 * @usecase Lets site owners manage downloadable lead magnets, ebooks, and meal plans stored in MongoDB GridFS.
 */
export default async function AdminAssetsPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  let assets: any[] = [];
  try {
    assets = await AssetStorageService.listAssets();
  } catch (err) {
    console.error('Error loading initial digital assets:', err);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <Link href="/admin" className="hover:text-teal-400 transition-colors">
                &larr; Admin Dashboard
              </Link>
              <span>/</span>
              <span className="text-slate-200">Digital Assets</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Digital Assets &amp; Secured Downloads
            </h1>
          </div>
          <Link
            href="/admin"
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs px-4 py-2 rounded-xl border border-slate-800 transition-colors"
          >
            Dashboard
          </Link>
        </div>

        {/* Client Interactive Assets Manager */}
        <AssetsManagerClient initialAssets={assets} />
      </div>
    </div>
  );
}
