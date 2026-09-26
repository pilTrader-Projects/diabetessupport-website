import { isAdminAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LearningService } from '@/services/learningService';
import ResourcesManagerClient from '@/components/admin/learning/ResourcesManagerClient';

export const revalidate = 0; // Dynamic admin dashboard

export default async function AdminResourcesPage() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const { resources, total } = await LearningService.listResources({ limit: 100 });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-400 mb-1">
            <Link href="/admin" className="hover:text-teal-400">
              Platform Admin
            </Link>
            <span>/</span>
            <Link href="/admin/learning/authorities" className="hover:text-teal-400">
              Learning Materials Hub
            </Link>
            <span>/</span>
            <span className="text-teal-400 font-bold">Resources Catalog</span>
          </div>
          <h1 className="text-3xl font-black text-white">Learning Materials Catalog &amp; Moderation</h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/learning/authorities"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors"
          >
            🩺 Monitored Doctors
          </Link>
          <Link
            href="/blog"
            target="_blank"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors"
          >
            🌐 Public Learning Hub
          </Link>
        </div>
      </div>

      <ResourcesManagerClient initialResources={resources} totalCount={total} />
    </div>
  );
}
