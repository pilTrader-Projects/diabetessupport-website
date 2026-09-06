'use client';

import React, { useState, useEffect } from 'react';
import { IReply } from '@/types/community';

interface ReplyFormProps {
  threadSlug: string;
  onReplyAdded: (reply: IReply) => void;
}

export default function ReplyForm({ threadSlug, onReplyAdded }: ReplyFormProps) {
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [currentToken, setCurrentToken] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAlias(localStorage.getItem('community_author_alias') || '');
      setEmail(localStorage.getItem('community_author_email') || '');
      setCurrentToken(localStorage.getItem('community_author_token') || '');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !alias.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/v1/community/threads/${threadSlug}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentToken ? { 'x-author-token': currentToken } : {}),
        },
        body: JSON.stringify({
          content: content.trim(),
          authorAlias: alias.trim(),
          authorEmail: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to post reply');
      }

      if (data.authorToken && typeof window !== 'undefined') {
        localStorage.setItem('community_author_token', data.authorToken);
        localStorage.setItem('community_author_alias', data.reply.authorAlias);
        localStorage.setItem('community_author_tag', data.reply.authorTag);
        if (email.trim()) localStorage.setItem('community_author_email', email.trim());
        setCurrentToken(data.authorToken);
      }

      onReplyAdded(data.reply);
      setContent('');
    } catch (err: any) {
      setError(err.message || 'Error posting reply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
      <h3 className="text-base font-bold text-slate-900">Add Your Reply</h3>
      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Display Name *</label>
            <input
              type="text"
              required
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              placeholder="e.g. Kuya Jun"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional, for alerts)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
          <textarea
            required
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your practical experience, tips, or words of encouragement..."
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}
