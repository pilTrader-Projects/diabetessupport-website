'use client';

import React, { useState, useEffect } from 'react';
import { IAuthority, IAffiliateRecommendation } from '@/types/learning';
import { getRecommendedBooksForAuthority } from '@/config/affiliateBooks';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';
import AffiliateBookModal from './AffiliateBookModal';

export interface AuthorityFormData {
  name: string;
  slug?: string;
  title: string;
  avatarUrl: string;
  bio: string;
  specialties: string;
  youtubeChannelId: string;
  podcastKeywords: string;
  pubMedQuery: string;
  websiteUrl: string;
  socialUrl: string;
  autoPublish: boolean;
  isActive: boolean;
  displayOrder: number;
  recommendedBooks?: IAffiliateRecommendation[];
}

interface AuthorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AuthorityFormData) => Promise<void>;
  initialData?: IAuthority | null;
  submitting: boolean;
}

const DEFAULT_FORM: AuthorityFormData = {
  name: '',
  title: '',
  avatarUrl: '',
  bio: '',
  specialties: 'Low Carb, Intermittent Fasting, Insulin Resistance',
  youtubeChannelId: '',
  podcastKeywords: '',
  pubMedQuery: '',
  websiteUrl: '',
  socialUrl: '',
  autoPublish: true,
  isActive: true,
  displayOrder: 0,
};

export default function AuthorityModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting,
}: AuthorityModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<AuthorityFormData>(() => {
    if (!initialData) return DEFAULT_FORM;
    return {
      name: initialData.name || '',
      slug: initialData.slug || '',
      title: initialData.title || '',
      avatarUrl: initialData.avatarUrl || '',
      bio: initialData.bio || '',
      specialties: (initialData.specialties || []).join(', '),
      youtubeChannelId: initialData.youtubeChannelId || '',
      podcastKeywords: initialData.podcastKeywords || '',
      pubMedQuery: initialData.pubMedQuery || '',
      websiteUrl: initialData.websiteUrl || '',
      socialUrl: initialData.socialUrl || '',
      autoPublish: initialData.autoPublish ?? true,
      isActive: initialData.isActive ?? true,
      displayOrder: initialData.displayOrder ?? 0,
    };
  });

  const [books, setBooks] = useState<IAffiliateRecommendation[]>(() => {
    if (!initialData) return [];
    return (initialData.recommendedBooks && initialData.recommendedBooks.length > 0)
      ? initialData.recommendedBooks
      : getRecommendedBooksForAuthority(initialData.slug || initialData.name);
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        title: initialData.title || '',
        avatarUrl: initialData.avatarUrl || '',
        bio: initialData.bio || '',
        specialties: (initialData.specialties || []).join(', '),
        youtubeChannelId: initialData.youtubeChannelId || '',
        podcastKeywords: initialData.podcastKeywords || '',
        pubMedQuery: initialData.pubMedQuery || '',
        websiteUrl: initialData.websiteUrl || '',
        socialUrl: initialData.socialUrl || '',
        autoPublish: initialData.autoPublish ?? true,
        isActive: initialData.isActive ?? true,
        displayOrder: initialData.displayOrder ?? 0,
      });

      const existingBooks =
        initialData.recommendedBooks && initialData.recommendedBooks.length > 0
          ? initialData.recommendedBooks
          : getRecommendedBooksForAuthority(initialData.slug || initialData.name);
      setBooks(existingBooks || []);
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

  const handleOpenEditBook = (index: number) => {
    setEditingBookIndex(index);
    setIsBookModalOpen(true);
  };

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
            <span className="text-2xl">🩺</span>
            <h3 className="text-xl font-bold text-white">
              {initialData ? 'Edit Authority / Personality' : 'Register New Authority / Doctor'}
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

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Full Name / Doctor Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Benjamin Bikman"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Title &amp; Credential <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Professor of Cell Biology, BYU"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Avatar / Photo URL
              </label>
              <input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Specialties / Topics (comma-separated)
              </label>
              <input
                type="text"
                value={formData.specialties}
                onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                placeholder="Low Carb, Insulin Resistance, Fasting"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Short Bio / Clinical Philosophy
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Renowned research scientist investigating the role of ketones and insulin in human metabolic health..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Feed Monitoring Setup */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-teal-400 font-bold text-xs uppercase tracking-wider">
                📡 Automated Content Ingestion Feeds
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                YouTube Channel (@handle, Channel URL, or Channel ID)
              </label>
              <input
                type="text"
                value={formData.youtubeChannelId}
                onChange={(e) => setFormData({ ...formData, youtubeChannelId: e.target.value })}
                placeholder="e.g. @benbikman, https://www.youtube.com/@benbikman, or UCblbxPFG0XAsQA2LwzT6xDQ"
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 text-xs font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Accepts full URLs, handles (@name), or UC IDs. The system automatically resolves and imports video uploads.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PubMed Author Query
                </label>
                <input
                  type="text"
                  value={formData.pubMedQuery}
                  onChange={(e) => setFormData({ ...formData, pubMedQuery: e.target.value })}
                  placeholder="e.g. Bikman B[Author]"
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Website / Bio Link
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://doctorwebsite.com"
                  className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Curated Books & Protocol Affiliates */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>📚</span> Curated Books &amp; Protocols ({books.length})
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Manage books or clinical protocols. Click Edit to update details in the dialog.
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
              <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500">
                  No books or programs configured yet for this authority. Click &quot;Add Book / Protocol&quot; above to add one.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {books.map((book, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {book.coverUrl ? (
                        <div className="w-11 h-16 shrink-0 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-16 shrink-0 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-center text-lg text-amber-400">
                          📖
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                            {book.badgeText || 'Book'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {book.platformName || 'Amazon'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-white truncate mt-1 group-hover:text-amber-300 transition-colors">
                          {book.title || 'Untitled Book'}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate">
                          {book.author ? `By ${book.author}` : ''}
                        </p>
                        {book.affiliateUrl && (
                          <a
                            href={book.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-amber-400/90 hover:underline inline-flex items-center gap-0.5 mt-0.5"
                          >
                            ↗ Test Link
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditBook(index)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold rounded-lg border border-slate-750 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <span>✏️</span> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveBook(index)}
                        className="px-2.5 py-1 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-[11px] font-medium rounded-lg transition-colors flex items-center gap-1"
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

          {/* Settings & Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-bold text-slate-300">Active Monitoring</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <input
                type="checkbox"
                checked={formData.autoPublish}
                onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded bg-slate-900 border-slate-700"
              />
              <span className="text-xs font-bold text-slate-300">Auto-Publish Ingested</span>
            </label>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Display Order</span>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value, 10) || 0 })}
                className="w-16 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs text-white"
              />
            </div>
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
              {submitting ? 'Saving...' : initialData ? 'Update Authority' : 'Register Authority'}
            </button>
          </div>
        </form>

        {/* Dedicated Sub-Dialog for Adding/Editing Book or Protocol */}
        <AffiliateBookModal
          isOpen={isBookModalOpen}
          onClose={() => setIsBookModalOpen(false)}
          onSave={handleSaveBook}
          initialData={editingBookIndex !== null ? books[editingBookIndex] : null}
          defaultAuthor={formData.name}
        />
      </div>
    </div>
  );
}
