'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ILearningResource, IAuthority } from '@/types/learning';
import ResourceShareModal from '@/components/learning/ResourceShareModal';
import { resolveRecommendedBooks } from '@/lib/recommendationResolver';
import CurationDetails from '@/components/learning/CurationDetails';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ILearningResource | null;
  authorities?: IAuthority[];
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

/**
 * Accessible, High-Performance Lite-Embed Video Player Modal.
 *
 * @usecase Streams YouTube videos via privacy-friendly youtube-nocookie with zero upfront tracking script bloat,
 * provides 'Watch on YouTube' external link, highlights 3 Key Takeaways, and enables direct social sharing.
 * Portaled to document.body to ensure strict viewport-fixed positioning regardless of parent container transforms.
 */
export default function VideoPlayerModal({
  isOpen,
  onClose,
  resource,
  authorities,
  isSaved = false,
  onToggleSave,
}: VideoPlayerModalProps): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle Escape key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  // Single Source of Truth: Resolve recommended books via pure domain utility
  const recommendedBooks = resolveRecommendedBooks(
    {
      recommendedBooks: resource.recommendedBooks,
      authorityId: resource.authorityId,
      authorityName: resource.authorityName,
      slug: resource.slug,
    },
    authorities
  );

  const originParam = typeof window !== 'undefined' ? `&origin=${encodeURIComponent(window.location.origin)}` : '';
  
  // Resilient embedId resolution: fallback to regex extraction if embedId is omitted but sourceUrl is YouTube
  let resolvedEmbedId = resource.embedId;
  if (!resolvedEmbedId && resource.sourceUrl && (resource.sourceUrl.includes('youtube.com') || resource.sourceUrl.includes('youtu.be'))) {
    const match = resource.sourceUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    if (match) resolvedEmbedId = match[1];
  }

  const embedUrl = resolvedEmbedId
    ? `https://www.youtube-nocookie.com/embed/${resolvedEmbedId}?autoplay=1&rel=0&playsinline=1&enablejsapi=1&modestbranding=1${originParam}`
    : null;

  const handleShare = async () => {
    const shareUrl = resource.sourceUrl || (typeof window !== 'undefined' ? window.location.href : '');
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback if clipboard not permitted
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-b from-slate-950 via-purple-950 to-blue-950 border border-white/20 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player Frame Area (Full 16:9 responsive frame with GPU isolation) */}
        <div
          className="relative w-full aspect-video bg-black shrink-0 overflow-hidden"
          style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden', contain: 'layout paint' }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={resource.title}
              loading="eager"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0 block"
              style={{ width: '100%', height: '100%' }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <span className="text-4xl">🎬</span>
              <p className="text-purple-200 text-sm">Direct embed player not available for this source.</p>
              <a
                href={resource.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
              >
                Watch Directly at Source &rarr;
              </a>
            </div>
          )}

          {/* Close button top right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close video player"
            className="absolute top-3 right-3 w-9 h-9 bg-black/80 hover:bg-black text-white rounded-full border border-white/20 backdrop-blur-md flex items-center justify-center transition-all z-10 shadow-lg text-sm font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Video Content & Takeaways (Scrollable body) */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Header & Source Jump Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/40">
                  {resource.type}
                </span>
                <span className="text-xs text-purple-200 font-semibold">{resource.authorityName}</span>
                {resource.duration && (
                  <span className="text-xs text-purple-300/80">• {resource.duration}</span>
                )}
              </div>
              <h2 id="video-modal-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                {resource.title}
              </h2>
            </div>

            {/* Direct Platform Jump Button & Share Encouragement */}
            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <span className="text-[11px] font-semibold text-purple-200 flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                <span>💡</span> Found this material valuable? Share it:
              </span>
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <a
                  href={resource.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <span>↗ Watch on YouTube</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-white/20 shadow-md hover:scale-[1.02] cursor-pointer"
                  title="Found this material valuable? Share it!"
                >
                  <span>🔗 Share</span>
                </button>

                {onToggleSave && resource._id && (
                  <button
                    type="button"
                    onClick={() => onToggleSave(resource._id!)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 cursor-pointer ${
                      isSaved
                        ? 'bg-amber-400/25 border-amber-300/40 text-amber-200 shadow-sm'
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                    }`}
                  >
                    <span>{isSaved ? '★ Saved' : '☆ Save'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Standardized Curation Template (Issue #44) */}
          <CurationDetails resource={resource} />

          {/* Contextual Affiliate Book & Protocol Recommendations */}
          {recommendedBooks.length > 0 && (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📖</span>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                    {`Recommended Reading by ${resource.authorityName || 'Author'}`}
                  </h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  Affiliate Selection
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedBooks.map((book) => (
                  <div
                    key={book._id || book.title}
                    className="flex gap-3 bg-white/10 border border-white/15 rounded-xl p-3 hover:border-amber-400/40 transition-all group backdrop-blur-sm"
                  >
                    {book.coverUrl ? (
                      <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-purple-950/60 shadow-md border border-white/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="w-full h-full bg-amber-950/40 flex items-center justify-center text-xl text-amber-400 font-bold">📖</div>';
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-24 shrink-0 rounded-lg bg-amber-900/30 border border-amber-600/30 flex items-center justify-center text-xl">
                        📚
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        {book.badgeText && (
                          <span className="text-[9px] font-black uppercase text-amber-300">
                            {book.badgeText}
                          </span>
                        )}
                        <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
                          {book.title}
                        </h4>
                        <p className="text-[11px] text-purple-200 line-clamp-2 mt-0.5">
                          {book.description}
                        </p>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <a
                          href={book.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-extrabold rounded-lg transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Get on {book.platformName?.split(' ')[0] || 'Amazon'} ↗</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-slate-500 leading-tight">
                Purchases made through these links support our evidence-based metabolic health advocacy at no extra cost to you.
              </p>
            </div>
          )}


          {/* Topic Tags */}
          {resource.topics && resource.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
              {resource.topics.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-slate-950 text-slate-300 px-3 py-1 rounded-lg border border-slate-800"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const fullContent = (
    <>
      {modalContent}
      <ResourceShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        resource={resource}
      />
    </>
  );

  // If in browser, portal to document.body; otherwise render directly (for SSR or test environments)
  if (mounted && typeof document !== 'undefined') {
    return createPortal(fullContent, document.body);
  }

  return fullContent;
}
