'use client';

import React, { useState, useEffect } from 'react';
import { StoredAssetSummary } from '@/services/assetStorageService';
import AssetUploadModal from './AssetUploadModal';
import GenerateLinkModal from './GenerateLinkModal';

interface AssetsManagerClientProps {
  initialAssets: StoredAssetSummary[];
}

/**
 * Client component for managing digital assets in MongoDB GridFS and secured download links.
 */
export default function AssetsManagerClient({
  initialAssets,
}: AssetsManagerClientProps): React.JSX.Element {
  const [assets, setAssets] = useState<StoredAssetSummary[]>(initialAssets);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedAssetForLink, setSelectedAssetForLink] = useState<StoredAssetSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/assets');
      const data = await res.json();
      if (res.ok && data.success) {
        setAssets(data.data || []);
      }
    } catch (err) {
      console.error('Failed to refresh assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" and all its active links?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/admin/assets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setAssets((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete asset:', err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalDownloads = assets.reduce((sum, a) => sum + (a.totalDownloads || 0), 0);
  const activeTokens = assets.reduce((sum, a) => sum + (a.activeTokensCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Digital Assets</div>
          <div className="text-3xl font-extrabold text-white">{assets.length}</div>
          <div className="text-xs text-teal-400 font-semibold">Stored in MongoDB GridFS</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Secure Links</div>
          <div className="text-3xl font-extrabold text-amber-400">{activeTokens}</div>
          <div className="text-xs text-slate-400 font-semibold">Protected with Expiration &amp; Quotas</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Download Events</div>
          <div className="text-3xl font-extrabold text-teal-400">{totalDownloads}</div>
          <div className="text-xs text-slate-400 font-semibold">Dispensed to Subscribers</div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Files &amp; Lead Magnets</h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload, generate secured download links, and monitor access quotas.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg transition-colors flex items-center gap-2"
        >
          <span>+ Upload New Asset</span>
        </button>
      </div>

      {/* Assets Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">File Name</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Active Links</th>
                <th className="py-3.5 px-4">Total Downloads</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-500">
                    No digital assets uploaded yet. Click &quot;+ Upload New Asset&quot; to get started.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-base">📄</span>
                        <span className="truncate max-w-xs">{asset.fileName}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{formatSize(asset.length)}</td>
                    <td className="py-3.5 px-4">
                      <span className="bg-amber-950/80 text-amber-300 px-2 py-0.5 rounded-md font-bold text-[11px]">
                        {asset.activeTokensCount} active
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-teal-400 font-bold">{asset.totalDownloads}</td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedAssetForLink(asset)}
                        className="bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Generate Link
                      </button>
                      <button
                        onClick={() => handleDelete(asset.id, asset.fileName)}
                        className="bg-slate-800 hover:bg-red-950 hover:text-red-400 text-slate-400 font-bold px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showUploadModal && (
        <AssetUploadModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={fetchAssets}
        />
      )}

      {selectedAssetForLink && (
        <GenerateLinkModal
          assetId={selectedAssetForLink.id}
          fileName={selectedAssetForLink.fileName}
          onClose={() => setSelectedAssetForLink(null)}
          onLinkGenerated={fetchAssets}
        />
      )}
    </div>
  );
}
