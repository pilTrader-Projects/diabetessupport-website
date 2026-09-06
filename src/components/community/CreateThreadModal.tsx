'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { COMMUNITY_CONFIG } from '@/config/constants';

interface CreateThreadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Zero-Friction Create Discussion Topic Modal Component.
 *
 * @usecase Lets visitors start a new community topic in 10 seconds without password registration.
 * @dependencies COMMUNITY_CONFIG, React useState/useEffect, Next.js useRouter.
 * @param {CreateThreadModalProps} props Modal open state and close callback.
 * @returns {JSX.Element | null} Rendered modal backdrop and form.
 */
export default function CreateThreadModal({
  isOpen,
  onClose,
}: CreateThreadModalProps) {
  const router = useRouter();
  const [alias, setAlias] = useState('');
  const [category, setCategory] = useState(COMMUNITY_CONFIG.categories[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [notify, setNotify] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAlias = localStorage.getItem('dc_author_alias') || '';
      const savedEmail = localStorage.getItem('dc_author_email') || '';
      if (savedAlias) setAlias(savedAlias);
      if (savedEmail) {
        setEmail(savedEmail);
        setNotify(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      let authorId = '';
      if (typeof window !== 'undefined') {
        authorId = localStorage.getItem('dc_author_id') || '';
        if (!authorId) {
          authorId = `usr_${Math.random().toString(36).substring(2, 10)}`;
          localStorage.setItem('dc_author_id', authorId);
        }
        localStorage.setItem('dc_author_alias', alias.trim() || 'Community Member');
        if (email.trim()) localStorage.setItem('dc_author_email', email.trim());
      }

      const res = await fetch('/api/v1/community/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          authorAlias: alias.trim() || 'Community Member',
          authorId,
          authorEmail: notify && email.trim() ? email.trim() : undefined,
          notifyOnReply: notify && Boolean(email.trim()),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create topic');
      }

      onClose();
      router.push(`/community/${json.data.slug}`);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-xl font-black text-slate-900">Start a New Discussion</h3>
            <p className="text-xs text-slate-500">Ask a question or share low-GI advice with the community</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Your Display Name / Nickname</label>
              <input
                type="text"
                required
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="e.g. Kuya Jun, Mama Sarah"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Topic Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
              >
                {COMMUNITY_CONFIG.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Discussion Title / Question</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Normal ba ang 135 blood sugar 2 hours after breakfast?"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Details / Background</label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what you ate, your symptoms, or routine so other members can share relevant experiences..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          {COMMUNITY_CONFIG.emailNotificationsEnabled && (
            <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
              <label className="flex items-center space-x-2 text-xs font-bold text-teal-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-teal-500"
                />
                <span>Email me when someone replies to this topic</span>
              </label>
              {notify && (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 bg-white border border-teal-300 rounded-lg text-xs"
                />
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing Topic...' : 'Post Discussion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
