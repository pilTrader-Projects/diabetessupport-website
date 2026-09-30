'use client';

import React, { useState, useEffect } from 'react';
import { IAuthority, IAffiliateRecommendation } from '@/types/learning';
import { getRecommendedBooksForAuthority } from '@/config/affiliateBooks';
import { ensureAffiliateUrl } from '@/lib/affiliateUtils';

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

  const handleAddBook = () => {
    setBooks([
      ...books,
      {
        title: '',
        author: formData.name || 'Author',
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
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span>📚</span> Curated Books &amp; Protocols (Affiliate Monetization)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Attach books, Kindle editions, or clinical protocols. Amazon URLs automatically receive your tracking tag.
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
              <div className="p-4 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center">
                <p className="text-xs text-slate-500">
                  No books or programs configured yet for this authority. Click &quot;Add Book / Protocol&quot; above to add one.
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
                          placeholder="e.g. Why We Get Sick"
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
                          placeholder="e.g. Dr. Benjamin Bikman"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Type
                        </label>
                        <select
                          value={book.type || 'book'}
                          onChange={(e) => handleUpdateBook(index, 'type', e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="book">Book (Paperback/Kindle)</option>
                          <option value="program">Paid Program / Course</option>
                          <option value="protocol">Clinical Protocol</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={book.platformName || 'Amazon'}
                          onChange={(e) => handleUpdateBook(index, 'platformName', e.target.value)}
                          placeholder="Amazon, Audible, Direct"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Badge Label
                        </label>
                        <input
                          type="text"
                          value={book.badgeText || ''}
                          onChange={(e) => handleUpdateBook(index, 'badgeText', e.target.value)}
                          placeholder="e.g. Essential Reading"
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
                          placeholder="https://images-na.ssl-images-amazon.com/..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Subtitle / Focus
                        </label>
                        <input
                          type="text"
                          value={book.subtitle || ''}
                          onChange={(e) => handleUpdateBook(index, 'subtitle', e.target.value)}
                          placeholder="e.g. Unlocking the Secret Behind Chronic Disease"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Short Clinical Synopsis / Why Read This
                      </label>
                      <textarea
                        rows={2}
                        value={book.description || ''}
                        onChange={(e) => handleUpdateBook(index, 'description', e.target.value)}
                        placeholder="Comprehensive scientific deep-dive into how insulin resistance triggers chronic disease..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
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
      </div>
    </div>
  );
}
