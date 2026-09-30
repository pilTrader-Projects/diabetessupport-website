'use client';

import React, { useState, useEffect } from 'react';
import { IPodcastChannel } from '@/types/learning';

export interface PodcastChannelFormData {
  name: string;
  slug?: string;
  host: string;
  avatarUrl: string;
  description: string;
  youtubeChannelId: string;
  spotifyShowId: string;
  applePodcastsUrl: string;
  websiteUrl: string;
  autoPublish: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface PodcastChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PodcastChannelFormData) => Promise<void>;
  initialData?: IPodcastChannel | null;
  submitting: boolean;
}

const DEFAULT_FORM: PodcastChannelFormData = {
  name: '',
  host: '',
  avatarUrl: '',
  description: '',
  youtubeChannelId: '',
  spotifyShowId: '',
  applePodcastsUrl: '',
  websiteUrl: '',
  autoPublish: true,
  isActive: true,
  displayOrder: 0,
};

export default function PodcastChannelModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  submitting,
}: PodcastChannelModalProps): React.JSX.Element | null {
  const [formData, setFormData] = useState<PodcastChannelFormData>(DEFAULT_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        slug: initialData.slug || '',
        host: initialData.host || '',
        avatarUrl: initialData.avatarUrl || '',
        description: initialData.description || '',
        youtubeChannelId: initialData.youtubeChannelId || '',
        spotifyShowId: initialData.spotifyShowId || '',
        applePodcastsUrl: initialData.applePodcastsUrl || '',
        websiteUrl: initialData.websiteUrl || '',
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
            <span className="text-2xl">🎙️</span>
            <h3 className="text-xl font-bold text-white">
              {initialData ? 'Edit Monitored Podcast Show' : 'Register Monitored Podcast Show'}
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Podcast Show Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. The Diary Of A CEO"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Host / Producer
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                placeholder="e.g. Steven Bartlett"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              YouTube Channel URL / Handle / UC ID *
            </label>
            <input
              type="text"
              required
              value={formData.youtubeChannelId}
              onChange={(e) => setFormData({ ...formData, youtubeChannelId: e.target.value })}
              placeholder="e.g. @TheDiaryOfACEO or UCblbxPFG0XAsQA2LwzT6xDQ"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500 font-mono text-xs"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              The cron syndication engine monitors this channel for guest appearances by registered authorities (e.g. Dr. Ben Bikman).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Avatar / Cover Image URL
            </label>
            <input
              type="text"
              value={formData.avatarUrl}
              onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
              placeholder="https://... or /images/podcasts/doac.jpg"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Show Description / Focus
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Business, health, and science interviews with global experts."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Spotify Show URL / ID
              </label>
              <input
                type="text"
                value={formData.spotifyShowId}
                onChange={(e) => setFormData({ ...formData, spotifyShowId: e.target.value })}
                placeholder="https://open.spotify.com/show/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Apple Podcasts URL
              </label>
              <input
                type="text"
                value={formData.applePodcastsUrl}
                onChange={(e) => setFormData({ ...formData, applePodcastsUrl: e.target.value })}
                placeholder="https://podcasts.apple.com/..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Website / Hub URL
              </label>
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://thediaryofaceo.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Auto-Publish Qualified Guest Episodes</p>
                <p className="text-xs text-slate-400">
                  When enabled, episodes where an authority is a guest and discussing metabolic health are automatically published.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.autoPublish}
                onChange={(e) => setFormData({ ...formData, autoPublish: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 text-teal-600 focus:ring-teal-500 bg-slate-700"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-700/40">
              <div>
                <p className="text-sm font-semibold text-white">Active in Syndication Cron</p>
                <p className="text-xs text-slate-400">
                  Disable to temporarily pause tracking without deleting this show configuration.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 rounded border-slate-600 text-teal-600 focus:ring-teal-500 bg-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-bold shadow-lg shadow-teal-900/40 transition-all disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialData ? 'Save Changes' : 'Register Podcast Show'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
