'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { IReply } from '@/types/community';

interface ReplyFormProps {
  threadSlug: string;
  onReplyAdded: (reply: IReply) => void;
}

export default function ReplyForm({ threadSlug, onReplyAdded }: ReplyFormProps) {
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [notifyOnReply, setNotifyOnReply] = useState(false);
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

    const resolvedEmail = notifyOnReply && email.trim() ? email.trim() : undefined;

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
          authorEmail: resolvedEmail,
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
        if (resolvedEmail) localStorage.setItem('community_author_email', resolvedEmail);
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
            {email.trim().length > 0 ? (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg space-y-1">
                <label className="flex items-center space-x-2 text-xs font-semibold text-emerald-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOnReply}
                    onChange={(e) => setNotifyOnReply(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Email me when someone replies to this discussion</span>
                </label>
                <p className="text-[11px] text-emerald-800 leading-tight">
                  Used solely for transactional reply alerts under our{' '}
                  <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-emerald-950">
                    Privacy Policy
                  </Link>. Never added to marketing sequences.
                </p>
              </div>
            ) : (
              <p className="mt-1 text-[11px] text-slate-500 leading-tight">
                Provide an email to receive transactional alerts when members reply. Never used for marketing.
              </p>
            )}
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

        {/* Public Health & Privacy Safe Harbor Notice */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 leading-relaxed">
          <span className="text-base shrink-0">⚠️</span>
          <span>
            <strong>Public Forum Notice:</strong> Discussions are publicly visible to all members. For your personal privacy and health safety, please do not include confidential medical records, diagnostic lab printouts, or sensitive personal identifiers.
          </span>
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
