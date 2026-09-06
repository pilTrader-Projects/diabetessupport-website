'use client';

import React from 'react';
import Link from 'next/link';
import { COMMUNITY_CONFIG } from '@/config/constants';

interface CommunityHeaderProps {
  activeCategory: string;
  searchQuery: string;
  totalThreads: number;
  onOpenNewThread: () => void;
  onOpenSyncModal: () => void;
}

/**
 * Header & Filter Navigation Bar for Community Discussion Forum.
 *
 * @usecase Renders peer-support disclaimer, category navigation pills, search bar, and action buttons.
 * @dependencies COMMUNITY_CONFIG, React.
 * @param {CommunityHeaderProps} props Active category, search query, thread count, and modal triggers.
 * @returns {JSX.Element} Rendered community header container.
 */
export default function CommunityHeader({
  activeCategory,
  searchQuery,
  totalThreads,
  onOpenNewThread,
  onOpenSyncModal,
}: CommunityHeaderProps) {
  const categories = ['All', ...COMMUNITY_CONFIG.categories];

  return (
    <div className="space-y-8">
      {/* Peer Support Safe Harbor Medical Disclaimer */}
      <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 sm:p-5 flex items-start space-x-3 shadow-sm">
        <span className="text-xl flex-shrink-0">⚠️</span>
        <div className="text-xs sm:text-sm text-amber-900 leading-relaxed space-y-1">
          <strong className="font-bold text-amber-950 block">
            Community Peer-to-Peer Safe Harbor:
          </strong>
          <p>
            Discussions, tips, and personal logs shared here reflect individual patient experiences and are for
            mutual support only. <strong>This board does not provide medical advice, diagnosis, or prescriptions.</strong> Always
            consult your physician or endocrinologist before adjusting diet or medication.
          </p>
        </div>
      </div>

      {/* Hero Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="bg-teal-100 text-teal-900 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200">
              💬 Community Board
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {totalThreads} Active {totalThreads === 1 ? 'Topic' : 'Topics'}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            DiabetesCare Community Discussions
          </h1>
          <p className="text-sm text-slate-600">
            Ask questions, share daily low-GI recipes, and exchange blood sugar management tips.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>📱↔️💻</span>
            <span>Sync Device</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewThread}
            className="text-xs font-black text-white bg-teal-600 hover:bg-teal-700 px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>✍️</span>
            <span>Ask Question / Post</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="space-y-4">
        <form method="GET" action="/community" className="max-w-xl flex gap-2">
          {activeCategory !== 'All' && (
            <input type="hidden" name="category" value={activeCategory} />
          )}
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search discussions (e.g. fasting sugar, sinigang, metformin)..."
            className="flex-1 pl-4 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          />
          <button
            type="submit"
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => {
            const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
            const href =
              cat === 'All'
                ? searchQuery
                  ? `/community?search=${encodeURIComponent(searchQuery)}`
                  : '/community'
                : searchQuery
                  ? `/community?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(searchQuery)}`
                  : `/community?category=${encodeURIComponent(cat)}`;

            return (
              <Link
                key={cat}
                href={href}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${isActive
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
