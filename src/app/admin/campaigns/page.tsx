import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { CampaignService } from '@/services/campaignService';
import { AssetStorageService } from '@/services/assetStorageService';
import CampaignsManagerClient from '@/components/admin/CampaignsManagerClient';

export const revalidate = 0; // Dynamic admin dashboard

/**
 * Brevo Campaigns & Lead Capture Mapping Admin Dashboard Page (/admin/campaigns).
 *
 * @usecase Displays, configures, and dynamically creates lead capture campaigns mapped to Brevo lists, metabolic stages, and downloadable digital assets.
 * @dependencies isAdminAuthenticated, CampaignService.getAllCampaigns, AssetStorageService.listAssets
 * @returns {Promise<JSX.Element>} Rendered campaign management dashboard.
 */
export default async function AdminCampaignsPage(): Promise<React.JSX.Element> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

  const [campaigns, assets] = await Promise.all([
    CampaignService.getAllCampaigns(),
    AssetStorageService.listAssets(),
  ]);

  const availableAssets = assets.map((a) => a.fileName);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              &larr; Admin Overview
            </Link>
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-teal-400">
            Marketing Automation Decoupling
          </span>
          <h1 className="text-3xl font-black text-white">
            Brevo Lead Capture &amp; Campaign Mappings
          </h1>
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

      {/* Main Interactive Client Interface */}
      <CampaignsManagerClient
        initialCampaigns={campaigns}
        availableAssets={availableAssets}
      />
    </div>
  );
}
