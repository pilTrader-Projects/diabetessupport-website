'use client';

import React, { useState, useEffect } from 'react';
import { IAffiliateRecommendation } from '@/types/learning';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';

interface AffiliateBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: IAffiliateRecommendation) => void;
  initialData?: IAffiliateRecommendation | null;
  defaultAuthor?: string;
}

const DEFAULT_BOOK: IAffiliateRecommendation = {
  title: '',
  author: '',
  type: 'book',
  subtitle: '',
  description: '',
  affiliateUrl: '',
  coverUrl: '',
  badgeText: 'Essential Reading',
  platformName: 'Amazon',
  topics: ['Metabolic Health'],
};

export default function AffiliateBookModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultAuthor = '',
}: AffiliateBookModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<IAffiliateRecommendation>(() => {
    if (initialData) return initialData;
    return { ...DEFAULT_BOOK, author: defaultAuthor };
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ ...DEFAULT_BOOK, author: defaultAuthor });
    }
  }, [initialData, defaultAuthor, isOpen]);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      affiliateUrl: ensureAffiliateUrl(val),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      ...formData,
      affiliateUrl: ensureAffiliateUrl(formData.affiliateUrl),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-750 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 space-y-5 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
          <div className="flex items-center space-x-2.5">
            <span className="text-xl">📚</span>
            <h3 className="text-lg font-bold text-white">
              {initialData ? 'Edit Curated Book / Protocol' : 'Add Curated Book or Protocol'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Live Preview Header if Cover Available */}
          <div className="flex gap-4 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl items-center">
            {formData.coverUrl ? (
              <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formData.coverUrl}
                  alt={formData.title || 'Book Preview'}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-20 shrink-0 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-center text-2xl text-amber-400">
                📖
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {formData.badgeText || 'Curated'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {formData.platformName || 'Amazon'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white truncate mt-1">
                {formData.title || 'Untitled Book / Protocol'}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {formData.author ? `By ${formData.author}` : 'Author not set'}
              </p>
            </div>
          </div>

          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Book / Program Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. The Diabetes Code"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Author Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                placeholder="e.g. Dr. Jason Fung, MD"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Subtitle / Focus */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Subtitle / Key Clinical Focus
            </label>
            <input
              type="text"
              value={formData.subtitle || ''}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Prevent and Reverse Type 2 Diabetes Naturally"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Type, Platform, Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Type
              </label>
              <select
                value={formData.type || 'book'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 text-xs"
              >
                <option value="book">Book (Paperback/Kindle)</option>
                <option value="program">Paid Program / Course</option>
                <option value="protocol">Clinical Protocol</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Platform Name
              </label>
              <input
                type="text"
                value={formData.platformName || ''}
                onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                placeholder="Amazon / Audible"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Badge Label
              </label>
              <input
                type="text"
                value={formData.badgeText || ''}
                onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                placeholder="Clinical Reversal Protocol"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
              />
            </div>
          </div>

          {/* Affiliate URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-300">
                Affiliate Link (SiteStripe or Product URL) <span className="text-rose-400">*</span>
              </label>
              {formData.affiliateUrl && (
                <a
                  href={formData.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                >
                  ↗ Test Link
                </a>
              )}
            </div>
            <input
              type="url"
              required
              value={formData.affiliateUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.amazon.com/dp/1771642658 or https://amzn.to/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Amazon URLs automatically ensure your tracking tag is attached. External sites and amzn.to shortlinks are preserved.
            </p>
          </div>

          {/* Cover Image URL */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Cover Image URL
            </label>
            <input
              type="url"
              value={formData.coverUrl || ''}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              placeholder="https://images-na.ssl-images-amazon.com/..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1">
              Short Clinical Synopsis / Why Read This
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="The landmark clinical reversal guide revealing how therapeutic fasting and dietary carbohydrate restriction relieve beta-cell stress..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold transition-colors text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-lg transition-colors text-xs"
            >
              Save Book Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
