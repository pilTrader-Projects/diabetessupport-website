'use client';

import React, { useState } from 'react';

interface GenerateLinkModalProps {
  assetId: string;
  fileName: string;
  onClose: () => void;
  onLinkGenerated?: () => void;
}

/**
 * Modal dialog for generating a secured, tokenized digital asset download link.
 *
 * @usecase Lets admin configure link expiration, max downloads quota, and copy the generated URL.
 */
export default function GenerateLinkModal({
  assetId,
  fileName,
  onClose,
  onLinkGenerated,
}: GenerateLinkModalProps): React.JSX.Element {
  const [expiresInHours, setExpiresInHours] = useState('48');
  const [maxDownloads, setMaxDownloads] = useState('3');
  const [loading, setLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/admin/assets/${assetId}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expiresInHours: Number(expiresInHours),
          maxDownloads: Number(maxDownloads),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate download link.');
      }

      setGeneratedUrl(data.downloadUrl);
      if (onLinkGenerated) onLinkGenerated();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white">Generate Secure Link</h3>
            <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1"
          >
            &times;
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs">
            {errorMessage}
          </div>
        )}

        {generatedUrl ? (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-950 border border-teal-800/60 rounded-xl space-y-2">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
                Secured Download URL
              </span>
              <input
                type="text"
                readOnly
                value={generatedUrl}
                className="w-full bg-transparent text-xs text-white font-mono break-all focus:outline-none select-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-3 rounded-xl transition-colors text-center"
              >
                {copied ? '✓ Copied to Clipboard!' : 'Copy Link'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-5 py-3 rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Link Expiration
              </label>
              <select
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-teal-500"
              >
                <option value="24">24 Hours (1 Day)</option>
                <option value="48">48 Hours (2 Days - Recommended)</option>
                <option value="168">7 Days (1 Week)</option>
                <option value="720">30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Maximum Allowed Downloads
              </label>
              <select
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm rounded-xl p-3 focus:outline-none focus:border-teal-500"
              >
                <option value="1">1 Download (Single-Use)</option>
                <option value="3">3 Downloads (Recommended)</option>
                <option value="5">5 Downloads</option>
                <option value="10">10 Downloads</option>
                <option value="1000">1,000 Downloads (High Volume)</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Create Secure Link'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
