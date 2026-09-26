'use client';

import React, { useState, useEffect } from 'react';
import { ILearningResource, ResourceType, ResourceStatus } from '@/types/learning';

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
  const [formData, setFormData] = useState<ResourceFormData>(DEFAULT_FORM);

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
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData, isOpen]);

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
    await onSubmit(formData);
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
