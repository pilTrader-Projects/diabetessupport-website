'use client';

import React, { useState, useEffect } from 'react';
import { ILearningResource, ResourceType, ResourceStatus, IAffiliateRecommendation } from '@/types/learning';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';
import AffiliateBookModal from './AffiliateBookModal';

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

  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBookIndex, setEditingBookIndex] = useState<number | null>(null);

  const handleOpenAddBook = () => {
    setEditingBookIndex(null);
    setIsBookModalOpen(true);
  };
  // Backward compatibility alias for HMR / fast refresh
  const handleAddBook = handleOpenAddBook;

  const handleOpenEditBook = (index: number) => {
    setEditingBookIndex(index);
    setIsBookModalOpen(true);
  };
  const handleEditBook = handleOpenEditBook;

  const handleSaveBook = (savedBook: IAffiliateRecommendation) => {
    if (editingBookIndex !== null && editingBookIndex >= 0) {
      setBooks((prev) => prev.map((b, i) => (i === editingBookIndex ? savedBook : b)));
    } else {
      setBooks((prev) => [...prev, savedBook]);
    }
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
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>📚</span> Contextual Books &amp; Protocols ({books.length})
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Optional: Attach specific books or protocols for this resource. Overrides default authority reading.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddBook}
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
              <div className="flex flex-col space-y-2.5">
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="p-3 sm:p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {book.coverUrl ? (
                        <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-sm relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<div class="w-full h-full bg-amber-950/40 flex items-center justify-center text-xl text-amber-400 font-bold">📖</div>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-xl bg-amber-950/30 border border-amber-800/40 flex items-center justify-center text-xl text-amber-400">
                          📖
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                            {book.badgeText || 'Book'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {book.platformName || 'Amazon'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                          {book.title || 'Untitled Book'}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {book.author ? `By ${book.author}` : ''}
                          {book.subtitle ? ` — ${book.subtitle}` : ''}
                        </p>
                        {book.affiliateUrl && (
                          <div className="pt-0.5">
                            <a
                              href={book.affiliateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] text-amber-400/90 hover:underline inline-flex items-center gap-1"
                            >
                              <span>↗ Test Link</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-row flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBook(index)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-xl border border-slate-750 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <span>✏️</span> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(index)}
                        className="px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
                        title="Remove book"
                      >
                        <span>🗑️</span> Remove
                      </button>
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

        {/* Dedicated Sub-Dialog for Adding/Editing Book or Protocol */}
        <AffiliateBookModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          onSave={handleSaveBook}
          initialData={editingBookIndex !== null ? books[editingBookIndex] : null}
          defaultAuthor={formData.authorityName}
        />
      </div>
    </div>
  );
}
