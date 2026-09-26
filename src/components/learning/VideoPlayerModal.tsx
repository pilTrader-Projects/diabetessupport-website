'use client';

import React from 'react';
import { ILearningResource } from '@/types/learning';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ILearningResource | null;
  isSaved?: boolean;
  onToggleSave?: (id: string) => void;
}

/**
 * Accessible, High-Performance Lite-Embed Video Player Modal.
 *
 * @usecase Streams YouTube videos via privacy-friendly youtube-nocookie with zero upfront tracking script bloat,
 * provides 'Watch on YouTube' external link, and highlights 3 Key Takeaways.
 */
export default function VideoPlayerModal({
  isOpen,
  onClose,
  resource,
  isSaved = false,
  onToggleSave,
}: VideoPlayerModalProps): React.JSX.Element | null {
  if (!isOpen || !resource) return null;

  const embedUrl = resource.embedId
    ? `https://www.youtube-nocookie.com/embed/${resource.embedId}?autoplay=1&rel=0`
    : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl space-y-6 text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Video Player Frame Area */}
        <div className="relative aspect-video w-full bg-black rounded-t-3xl overflow-hidden">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center space-y-3 p-6 text-center">
              <span className="text-4xl">🎬</span>
              <p className="text-slate-400 text-sm">Direct embed player not available for this source.</p>
              <a
                href={resource.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-colors"
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
            className="absolute top-3 right-3 bg-black/70 hover:bg-black text-white p-2 rounded-full border border-white/20 backdrop-blur-md transition-all z-10"
          >
            ✕
          </button>
        </div>

        {/* Video Content & Takeaways */}
        <div className="p-6 sm:p-8 pt-0 space-y-6">
          {/* Header & Source Jump Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-400 border border-teal-800">
                  {resource.type}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{resource.authorityName}</span>
                {resource.duration && (
                  <span className="text-xs text-slate-500">• {resource.duration}</span>
                )}
              </div>
              <h2 id="video-modal-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                {resource.title}
              </h2>
            </div>

            {/* Direct Platform Jump Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <a
                href={resource.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg transition-colors inline-flex items-center justify-center gap-2"
              >
                <span>↗ Watch on YouTube</span>
              </a>

              {onToggleSave && resource._id && (
                <button
                  type="button"
                  onClick={() => onToggleSave(resource._id!)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border inline-flex items-center gap-1.5 ${
                    isSaved
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span>{isSaved ? '★ Saved' : '☆ Save'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 3 Key Takeaways Card */}
          {resource.keyTakeaways && resource.keyTakeaways.length > 0 && (
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-teal-500/30 rounded-2xl p-5 space-y-3 shadow-inner">
              <div className="flex items-center space-x-2">
                <span className="text-lg">💡</span>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-teal-400">
                  Key Scientific Takeaways (10-Second Summary)
                </h3>
              </div>
              <ul className="space-y-2">
                {resource.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2.5 text-xs text-slate-300 leading-relaxed">
                    <span className="text-teal-400 font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Overview / Bio */}
          <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">Overview</h4>
            <p>{resource.summary}</p>
          </div>

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
}
