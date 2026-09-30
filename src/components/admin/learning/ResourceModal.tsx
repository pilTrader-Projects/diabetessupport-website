'use client';

import React, { useState, useEffect } from 'react';
import { ILearningResource, ResourceType, ResourceStatus, IAffiliateRecommendation } from '@/types/learning';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';

export interface ResourceFormData {
  title: string;
  type: ResourceType;
  authorityName: string;
  authorityTitle?: string;
  sourceUrl: string;
  embedId?: string;
  thumbnailUrl?: string;
  duration?: string;
  summary: string;
  keyTakeaways: string; // newline separated
  topics: string; // comma separated
  status: ResourceStatus;
  recommendedBooks?: IAffiliateRecommendation[];
}

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  initialData?: ILearningResource | null;
  submitting: boolean;
}

const DEFAULT_FORM: ResourceFormData = {
  title: '',
  type: 'video',
  authorityName: '',
  authorityTitle: '',
  sourceUrl: '',
  embedId: '',
  thumbnailUrl: '',
  duration: '',
  summary: '',
  keyTakeaways: '',
  topics: 'Low Carb, Intermittent Fasting',
  status: 'published',
};

export default function ResourceModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting,
}: ResourceModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<ResourceFormData>(() => {
    if (!initialData) return DEFAULT_FORM;
    return {
      title: initialData.title || '',
      type: initialData.type || 'video',
      authorityName: initialData.authorityName || '',
      authorityTitle: initialData.authorityTitle || '',
      sourceUrl: initialData.sourceUrl || '',
      embedId: initialData.embedId || '',
      thumbnailUrl: initialData.thumbnailUrl || '',
      duration: initialData.duration || '',
      summary: initialData.summary || '',
      keyTakeaways: (initialData.keyTakeaways || []).join('\n'),
      topics: (initialData.topics || []).join(', '),
      status: initialData.status || 'published',
    };
  });

  const [books, setBooks] = useState<IAffiliateRecommendation[]>(() => {
    return initialData?.recommendedBooks || [];
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        type: initialData.type || 'video',
        authorityName: initialData.authorityName || '',
        authorityTitle: initialData.authorityTitle || '',
        sourceUrl: initialData.sourceUrl || '',
        embedId: initialData.embedId || '',
        thumbnailUrl: initialData.thumbnailUrl || '',
        duration: initialData.duration || '',
        summary: initialData.summary || '',
        keyTakeaways: (initialData.keyTakeaways || []).join('\n'),
        topics: (initialData.topics || []).join(', '),
        status: initialData.status || 'published',
      });
      setBooks(initialData.recommendedBooks || []);
    } else {
      setFormData(DEFAULT_FORM);
      setBooks([]);
    }
  }, [initialData, isOpen]);

  const handleAddBook = () => {
    setBooks([
      ...books,
      {
        title: '',
        author: formData.authorityName || 'Author',
        type: 'book',
        subtitle: '',
        description: '',
        affiliateUrl: '',
        coverUrl: '',
        badgeText: 'Recommended',
        platformName: 'Amazon',
        topics: ['Metabolic Health'],
      },
    ]);
  };

  const handleUpdateBook = (index: number, field: keyof IAffiliateRecommendation, value: any) => {
    setBooks((prev) =>
      prev.map((b, i) => {
        if (i !== index) return b;
        let finalVal = value;
        if (field === 'affiliateUrl' && typeof value === 'string') {
          finalVal = ensureAffiliateUrl(value);
        }
        return { ...b, [field]: finalVal };
      })
    );
  };

  const handleRemoveBook = (index: number) => {
    setBooks((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  // Auto-extract YouTube video ID when pasting sourceUrl
  const handleUrlChange = (url: string) => {
    const updated = { ...formData, sourceUrl: url };
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
      if (match) {
        updated.embedId = match[1];
        if (!updated.thumbnailUrl) {
          updated.thumbnailUrl = `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
        }
      }
    }
    setFormData(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...formData,
      recommendedBooks: books,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">📖</span>
            <h3 className="text-xl font-bold text-white">
              {initialData ? 'Edit Learning Resource' : 'Add Learning Resource Manually'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Resource Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Insulin vs. Glucagon: The Master Hormonal Switch"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Content Type <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as ResourceType })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="video">🎬 Video Lecture / Talk</option>
                <option value="podcast">🎙️ Podcast Episode</option>
                <option value="study">🔬 Clinical Study / Paper</option>
                <option value="article">📖 Guide / Article</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ResourceStatus })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-teal-500"
              >
                <option value="published">🟢 Published (Live)</option>
                <option value="pending_review">🟡 Pending Review</option>
                <option value="archived">⚪ Archived</option>
                <option value="broken_link">🔴 Flagged / Broken Link</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Author / Doctor Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.authorityName}
                onChange={(e) => setFormData({ ...formData, authorityName: e.target.value })}
                placeholder="e.g. Dr. Benjamin Bikman"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Author Title / Affiliation
              </label>
              <input
                type="text"
                value={formData.authorityTitle}
                onChange={(e) => setFormData({ ...formData, authorityTitle: e.target.value })}
                placeholder="e.g. Professor of Cell Biology, BYU"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Source URL (YouTube link, PubMed DOI, or host article) <span className="text-rose-400">*</span>
            </label>
            <input
              type="url"
              required
              value={formData.sourceUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Embed ID (e.g. YouTube ID)
              </label>
              <input
                type="text"
                value={formData.embedId}
                onChange={(e) => setFormData({ ...formData, embedId: e.target.value })}
                placeholder="e.g. abc123xyz"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Duration / Read Time
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 24:15 or 8 min read"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Topic Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.topics}
                onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
                placeholder="Low Carb, Fasting"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Summary / Overview <span className="text-rose-400">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              placeholder="Overview of the core scientific mechanism or lecture..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-teal-400 mb-1">
              💡 3 Key Scientific Takeaways (one per line - shown on card &amp; player)
            </label>
            <textarea
              rows={3}
              value={formData.keyTakeaways}
              onChange={(e) => setFormData({ ...formData, keyTakeaways: e.target.value })}
              placeholder="Elevated insulin locks adipose stores from lipolysis.&#10;Intermittent fasting enables deep glycogen depletion and activates autophagy.&#10;Ketone production provides steady non-glucose energy to cerebral neurons."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 text-xs font-mono"
            />
          </div>

          {/* Curated Books & Protocol Affiliates */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>📚</span> Contextual Books &amp; Protocols (Affiliate Monetization)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional: Attach specific books or protocols for this resource. Overrides default authority reading.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddBook}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold rounded-xl border border-amber-500/30 transition-colors self-start sm:self-auto flex items-center gap-1"
              >
                <span>+</span> Add Book / Protocol
              </button>
            </div>

            {books.length === 0 ? (
              <div className="p-3 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500">
                  No resource-specific books attached. Will inherit default reading from {formData.authorityName || 'authority'}.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-amber-400/90">
                        Item #{index + 1}: {book.title || 'Untitled Book/Protocol'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(index)}
                        className="text-[11px] text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded hover:bg-rose-950/40 transition-colors"
                      >
                        🗑️ Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Book / Program Title <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={book.title}
                          onChange={(e) => handleUpdateBook(index, 'title', e.target.value)}
                          placeholder="e.g. The Diabetes Code"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Author Name
                        </label>
                        <input
                          type="text"
                          value={book.author}
                          onChange={(e) => handleUpdateBook(index, 'author', e.target.value)}
                          placeholder="e.g. Dr. Jason Fung"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-semibold text-slate-400">
                          Affiliate Link (SiteStripe or Product URL) <span className="text-rose-400">*</span>
                        </label>
                        {book.affiliateUrl && (
                          <a
                            href={book.affiliateUrl}
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
                        value={book.affiliateUrl}
                        onChange={(e) => handleUpdateBook(index, 'affiliateUrl', e.target.value)}
                        placeholder="https://amzn.to/3xyz or https://www.amazon.com/dp/..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Cover Image URL
                        </label>
                        <input
                          type="url"
                          value={book.coverUrl || ''}
                          onChange={(e) => handleUpdateBook(index, 'coverUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Short Clinical Synopsis / Why Read This
                        </label>
                        <input
                          type="text"
                          value={book.description || ''}
                          onChange={(e) => handleUpdateBook(index, 'description', e.target.value)}
                          placeholder="Clinical protocol for reversing insulin resistance..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-extrabold shadow-lg transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Update Resource' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
