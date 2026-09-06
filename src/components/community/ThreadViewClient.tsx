'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdUnit from '@/components/ads/AdUnit';
import ReplyCard from './ReplyCard';
import ReplyForm from './ReplyForm';
import SocialShareBar from './SocialShareBar';
import { IThread, IReply } from '@/types/community';

interface ThreadViewClientProps {
  thread: IThread;
  initialReplies: IReply[];
}

export default function ThreadViewClient({ thread, initialReplies }: ThreadViewClientProps) {
  const [replies, setReplies] = useState<IReply[]>(initialReplies);
  const [currentTag, setCurrentTag] = useState('');
  const [currentAlias, setCurrentAlias] = useState('');
  const [reported, setReported] = useState(false);
  const [reportCount, setReportCount] = useState(thread.reportCount || 0);
  const [likesCount, setLikesCount] = useState(thread.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentAlias(localStorage.getItem('community_author_alias') || '');
      setCurrentTag(localStorage.getItem('community_author_tag') || '');
      const likedThreads = JSON.parse(localStorage.getItem('community_liked_threads') || '[]');
      if (likedThreads.includes(thread.slug)) {
        setIsLiked(true);
      }
    }
  }, [thread.slug]);

  const handleLike = async () => {
    if (isLiked) return;
    setIsLiked(true);
    setLikesCount((prev) => prev + 1);

    if (typeof window !== 'undefined') {
      const likedThreads = JSON.parse(localStorage.getItem('community_liked_threads') || '[]');
      likedThreads.push(thread.slug);
      localStorage.setItem('community_liked_threads', JSON.stringify(likedThreads));
    }

    try {
      await fetch(`/api/v1/community/threads/${thread.slug}/like`, { method: 'POST' });
    } catch (err) {
      // Optimistic state remains smooth
    }
  };

  const handleReport = () => {
    if (reported) return;
    if (confirm('Report this discussion for medical misinformation or spam?')) {
      setReported(true);
      setReportCount((prev) => prev + 1);
    }
  };

  const handleReplyAdded = (newReply: IReply) => {
    setReplies((prev) => [...prev, newReply]);
    if (typeof window !== 'undefined') {
      setCurrentAlias(localStorage.getItem('community_author_alias') || '');
      setCurrentTag(localStorage.getItem('community_author_tag') || '');
    }
  };

  const isQuarantined = thread.status === 'flagged' || reportCount >= 2;
  const isCurrentUserOp = currentTag === thread.authorTag && currentAlias === thread.authorAlias;
  const formattedDate = thread.createdAt
    ? new Date(thread.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Recently';
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://diabetescareph.com/community/${thread.slug}`;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Breadcrumb & Report Action */}
      <div className="flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center space-x-2">
          <Link href="/community" className="hover:text-emerald-600 font-medium">← All Discussions</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{thread.category}</span>
        </div>
        <button
          onClick={handleReport}
          disabled={reported}
          className="text-xs text-rose-500 hover:text-rose-700 disabled:opacity-50 transition-colors"
        >
          {reported ? '🚩 Reported' : '🚩 Report Discussion'}
        </button>
      </div>

      {/* Quarantined Moderation Banner */}
      {isQuarantined && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start space-x-3">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold">Discussion Under Moderation Review</p>
            <p className="text-xs text-amber-700 mt-0.5">
              This topic has received reports from community members and is undergoing review. Advertisements and indexing are disabled.
            </p>
          </div>
        </div>
      )}

      {/* Main OP Thread Card */}
      <article className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shadow-inner">
              {thread.authorAlias.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{thread.authorAlias}</span>
                <span className="text-xs text-slate-400 font-mono">{thread.authorTag}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  OP 👑
                </span>
                {isCurrentUserOp && (
                  <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{formattedDate}</span>
            </div>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">
            {thread.category}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
          {thread.title}
        </h1>

        <div className="text-slate-700 leading-relaxed whitespace-pre-line text-base md:text-lg">
          {thread.content}
        </div>

        {/* Social Share & Helpful Like Bar */}
        <SocialShareBar
          title={thread.title}
          url={pageUrl}
          snippet={thread.content}
          showLikeButton={true}
          likesCount={likesCount}
          onLike={handleLike}
          isLiked={isLiked}
        />
      </article>

      {/* Mid-Thread AdSense Unit (Suppressed if quarantined) */}
      {!isQuarantined && (
        <div className="my-6">
          <AdUnit slotId="community-thread-mid" format="horizontal" />
        </div>
      )}

      {/* Replies List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
          <span>💬 Community Replies</span>
          <span className="text-sm font-normal text-slate-500">({replies.length})</span>
        </h2>

        {replies.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
            No replies yet. Be the first to share your experience or offer encouragement!
          </div>
        ) : (
          replies.map((reply, idx) => (
            <ReplyCard
              key={reply._id || idx}
              reply={reply}
              isOp={reply.isOp || reply.authorTag === thread.authorTag}
              isYou={reply.authorTag === currentTag && reply.authorAlias === currentAlias}
            />
          ))
        )}
      </div>

      {/* Reply Submission Box */}
      <ReplyForm threadSlug={thread.slug} onReplyAdded={handleReplyAdded} />
    </div>
  );
}
