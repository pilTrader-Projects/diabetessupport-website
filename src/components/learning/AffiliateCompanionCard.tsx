'use client';

import React, { useState } from 'react';
import { IAffiliateRecommendation } from '@/types/learning';
import { stopPropagation } from '@/lib/affiliateFlankUtils';
import { handleAffiliateClick } from '@/analytics/handlers/handleAffiliateClick';
import { AffiliateLink } from '@/components/common/AffiliateLink';

interface AffiliateCompanionCardProps {
  book: IAffiliateRecommendation;
  variant?: 'flank' | 'inline';
  className?: string;
  position?: 'left_sidebar' | 'right_sidebar' | 'inline_modal' | string;
}

/**
 * Reusable, High-Converting Affiliate Companion Card Component.
 *
 * @usecase Renders book/protocol affiliate recommendations both as floating flanks
 * beside the desktop video player and within the inline modal body, adhering to DRY.
 * Clicking anywhere on the card or CTA opens the affiliate link in a new tab without closing the video player.
 */
export default function AffiliateCompanionCard({
  book,
  variant = 'flank',
  className = '',
  position,
}: AffiliateCompanionCardProps): React.JSX.Element {
  const [imageFailed, setImageFailed] = useState(false);

  const handleImageError = (): void => {
    setImageFailed(true);
  };

  const platformDisplay = book.platformName?.split(' ')[0] || 'Amazon';
  const isFlank = variant === 'flank';
  const cardPosition = position || (isFlank ? 'left_sidebar' : 'inline_modal');

  return (
    <AffiliateLink
      href={book.affiliateUrl}
      merchant={platformDisplay}
      label={book.title}
      position={cardPosition}
      variant="plain"
      onClick={handleAffiliateClick}
      className={`group block transition-all duration-200 select-none ${
        isFlank
          ? 'bg-slate-900/90 hover:bg-slate-900 border border-white/20 hover:border-amber-400/60 rounded-2xl p-3.5 shadow-xl hover:shadow-amber-500/10 backdrop-blur-xl'
          : 'bg-white/10 hover:bg-white/15 border border-white/15 hover:border-amber-400/40 rounded-xl p-3 backdrop-blur-sm shadow-sm'
      } ${className}`}
      title={`Open ${book.title} on ${platformDisplay} in a new tab`}
    >
      <div className="flex gap-3">
        {/* Book Cover / Platform Art */}
        {book.coverUrl && !imageFailed ? (
          <div
            className={`shrink-0 rounded-lg overflow-hidden bg-purple-950/60 shadow-md border border-white/10 ${
              isFlank ? 'w-16 h-24' : 'w-16 h-24'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={book.coverUrl}
              alt={book.title}
              referrerPolicy="no-referrer"
              onError={handleImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        ) : (
          <div
            className={`shrink-0 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-xl text-amber-400 shadow-md ${
              isFlank ? 'w-16 h-24' : 'w-16 h-24'
            }`}
          >
            📚
          </div>
        )}

        {/* Text Context & Metadata */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-300 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.5 rounded-full inline-block">
                {book.badgeText || 'Companion Book'}
              </span>
              <span
                onClick={(e) => {
                  stopPropagation(e);
                  window.open('/disclosure', '_blank', 'noopener,noreferrer');
                }}
                className="text-[9px] text-amber-200/80 hover:text-amber-300 underline cursor-pointer transition-colors"
                title="View affiliate monetization disclosure"
              >
                (affiliate link)
              </span>
            </div>

            <h4 className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
              {book.title}
            </h4>

            {book.author && (
              <span className="text-[10px] text-purple-200/90 font-medium block truncate mt-0.5">
                {book.author}
              </span>
            )}
          </div>

          {!isFlank && (
            <p className="text-[11px] text-purple-200 line-clamp-2 mt-1">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Comprehensive Brief Context (for Flank view) */}
      {isFlank && book.description && (
        <p className="text-[11px] text-slate-300/90 line-clamp-3 leading-relaxed mt-2.5 pt-2 border-t border-white/10">
          {book.description}
        </p>
      )}

      {/* Direct CTA Action Button */}
      <div className="mt-3">
        <span
          className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-black tracking-wide inline-flex items-center justify-center gap-1.5 transition-all shadow-sm ${
            isFlank
              ? 'bg-gradient-to-r from-amber-500 to-amber-400 group-hover:from-amber-400 group-hover:to-amber-300 text-slate-950 shadow-amber-500/20'
              : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
          }`}
        >
          <span>Get on {platformDisplay} ↗</span>
        </span>
      </div>
    </AffiliateLink>
  );
}
