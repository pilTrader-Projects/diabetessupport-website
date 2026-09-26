'use client';

import React, { useState, useEffect } from 'react';
import { IAuthority } from '@/types/learning';

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
  const [formData, setFormData] = useState<AuthorityFormData>(DEFAULT_FORM);

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
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
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
                Official YouTube Channel ID
              </label>
              <input
                type="text"
                value={formData.youtubeChannelId}
                onChange={(e) => setFormData({ ...formData, youtubeChannelId: e.target.value })}
                placeholder="e.g. UCXvLhAqyQvFz9D64QZp7wBg (from channel URL: /channel/UC...)"
                className="w-full bg-slate-900 border border-slate-750 rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                System automatically queries official public RSS to import newest video uploads with zero API quotas.
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
