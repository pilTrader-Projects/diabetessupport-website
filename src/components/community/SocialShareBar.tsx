'use client';

import React, { useState } from 'react';

interface SocialShareBarProps {
  title: string;
  url: string;
  snippet?: string;
  showLikeButton?: boolean;
  likesCount?: number;
  onLike?: () => void;
  isLiked?: boolean;
}

/**
 * Lightweight, Zero-CLS Social Media Sharing & Reactions Bar.
 *
 * @usecase Enables 1-click sharing to Facebook, LinkedIn, X/Twitter, Viber, and clipboard with formatted quote snippets.
 */
export default function SocialShareBar({
  title,
  url,
  snippet,
  showLikeButton = false,
  likesCount = 0,
  onLike,
  isLiked = false,
}: SocialShareBarProps) {
  const [copied, setCopied] = useState(false);

  const cleanSnippet = snippet ? snippet.slice(0, 160).replace(/\s+/g, ' ').trim() : '';
  const shareText = cleanSnippet ? `"${cleanSnippet}..." — Join the discussion on DiabetesCare PH:` : title;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: shareText,
          url,
        });
      } catch (err) {
        // User canceled or share failed; fall back gracefully
      }
    } else {
      handleCopyQuote();
    }
  };

  const handleCopyQuote = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const textToCopy = cleanSnippet
        ? `"${cleanSnippet}..."\n\n🔗 Read full discussion on DiabetesCare PH:\n${url}`
        : `${title}\n${url}`;
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const viberUrl = `viber://forward?text=${encodeURIComponent(shareText + '\n' + url)}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs">
      {/* Left: Optional Helpful / Like reaction */}
      <div className="flex items-center space-x-2">
        {showLikeButton && (
          <button
            type="button"
            onClick={onLike}
            disabled={isLiked}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full font-bold transition-all ${
              isLiked
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 cursor-pointer'
            }`}
          >
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{likesCount} {likesCount === 1 ? 'Helpful' : 'Helpful'}</span>
          </button>
        )}
      </div>

      {/* Right: Social Share Buttons */}
      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-slate-400 font-semibold mr-1">Share:</span>

        {/* Copy Quote Button */}
        <button
          type="button"
          onClick={handleCopyQuote}
          title="Copy snippet and link"
          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
        >
          <span>{copied ? '✅' : '📋'}</span>
          <span>{copied ? 'Quote Copied!' : 'Copy Link'}</span>
        </button>

        {/* Native Mobile Share Sheet Button */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="sm:hidden inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors cursor-pointer"
        >
          <span>📲</span>
          <span>Share</span>
        </button>

        {/* Facebook */}
        <a
          href={fbUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share to Facebook"
          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-semibold transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href={linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share to LinkedIn"
          className="p-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg font-semibold transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>

        {/* X / Twitter */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share to X"
          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>

        {/* Viber */}
        <a
          href={viberUrl}
          title="Share on Viber"
          className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg font-semibold transition-colors"
        >
          <span className="font-bold text-xs">🟣 Viber</span>
        </a>
      </div>
    </div>
  );
}
