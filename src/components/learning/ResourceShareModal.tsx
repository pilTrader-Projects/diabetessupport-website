'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ILearningResource } from '@/types/learning';
import { SITE_CONFIG } from '@/config/constants';

interface ResourceShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ILearningResource | null;
}

/**
 * Reusable Social Share Modal with Dynamic Photo Thumbnail Preview.
 *
 * @usecase Generates direct share intents for Facebook, X, WhatsApp, Viber, LinkedIn,
 * and native mobile apps with dynamic Open Graph thumbnail metadata.
 */
export default function ResourceShareModal({
  isOpen,
  onClose,
  resource,
}: ResourceShareModalProps): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !resource) return null;

  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : `https://${SITE_CONFIG.domain}`;

  // Direct canonical deep-link that serves the dynamic OG photo thumbnail to Facebook/X/WhatsApp crawlers
  const shareUrl =
    resource.type === 'article'
      ? `${origin}/learn/${resource.slug}`
      : `${origin}/learn?resource=${encodeURIComponent(resource.slug || resource._id || '')}`;

  const shareTitle = resource.title;
  const shareText = `${resource.title} — Evidence-based metabolic health lecture by ${resource.authorityName}`;

  const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;
  const whatsAppShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
  const viberShareUrl = `viber://forward?text=${encodeURIComponent(shareTitle + '\n' + shareUrl)}`;
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl text-slate-100 p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">📤</span>
            <h3 id="share-modal-title" className="text-base font-bold text-white">
              Share Learning Material
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share dialog"
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Photo Thumbnail Preview */}
        {resource.thumbnailUrl ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resource.thumbnailUrl}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between">
              <span className="self-start text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-black/80 text-teal-400 border border-teal-500/40">
                📸 Shared Photo Thumbnail
              </span>
              <p className="text-xs font-bold text-white line-clamp-2 drop-shadow-md">
                {resource.title}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-bold truncate">
            {resource.title}
          </div>
        )}

        {/* Direct Sharing Platform Action Grid */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
            Share directly to:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Facebook */}
            <a
              href={fbShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 transition-all gap-1.5 group text-center"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-[11px] font-bold">Facebook</span>
            </a>

            {/* X / Twitter */}
            <a
              href={twitterShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:text-white transition-all gap-1.5 group text-center"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span className="text-[11px] font-bold">X (Twitter)</span>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsAppShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all gap-1.5 group text-center"
            >
              <span className="text-xl">💬</span>
              <span className="text-[11px] font-bold">WhatsApp</span>
            </a>

            {/* Viber */}
            <a
              href={viberShareUrl}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 transition-all gap-1.5 group text-center"
            >
              <span className="text-xl">🟣</span>
              <span className="text-[11px] font-bold">Viber</span>
            </a>
          </div>
        </div>

        {/* Mobile Native Share (Instagram / Stories / Messenger) */}
        <button
          type="button"
          onClick={handleNativeShare}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <span>📸</span>
          <span>Share to Instagram / More Apps</span>
        </button>

        {/* Link Copy Box */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            When shared, platforms will dynamically display this material&apos;s photo thumbnail and title.
          </p>
        </div>
      </div>
    </div>
  );

  if (mounted && typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}
