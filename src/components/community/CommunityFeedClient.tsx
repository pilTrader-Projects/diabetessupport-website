'use client';

import React, { useState } from 'react';
import CommunityHeader from './CommunityHeader';
import CreateThreadModal from './CreateThreadModal';
import SyncDeviceModal from './SyncDeviceModal';
import ThreadCard from './ThreadCard';
import AdUnit from '../ads/AdUnit';
import { IThread } from '@/types/community';
import Link from 'next/link';

interface CommunityFeedClientProps {
  threads: IThread[];
  activeCategory: string;
  searchQuery: string;
  total: number;
  page: number;
  totalPages: number;
}

/**
 * Interactive Client Component for Community Discussion Feed.
 *
 * @usecase Bridges server-fetched thread documents with client-side interactive modals and zero-CLS in-feed ads.
 * @dependencies CommunityHeader, CreateThreadModal, SyncDeviceModal, ThreadCard, AdUnit.
 * @param {CommunityFeedClientProps} props Threads collection and active filters.
 * @returns {JSX.Element} Rendered community directory feed.
 */
export default function CommunityFeedClient({
  threads,
  activeCategory,
  searchQuery,
  total,
  page,
  totalPages,
}: CommunityFeedClientProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  return (
    <div className="space-y-10">
      <CommunityHeader
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        totalThreads={total}
        onOpenNewThread={() => setIsCreateOpen(true)}
        onOpenSyncModal={() => setIsSyncOpen(true)}
      />

      {threads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
          <span className="text-4xl block">💬</span>
          <h3 className="text-lg font-bold text-slate-900">No discussions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to start a conversation or ask a question in the{' '}
            <span className="font-bold text-teal-800">{activeCategory}</span> category.
          </p>
          <div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Start First Discussion
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {threads.slice(0, 4).map((thread) => (
              <ThreadCard key={thread._id} thread={thread} />
            ))}
          </div>

          {/* In-Feed Native AdSense Placement between cards */}
          <AdUnit slotId="community-in-feed-slot" className="my-6" />

          {threads.length > 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {threads.slice(4).map((thread) => (
                <ThreadCard key={thread._id} thread={thread} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 pt-6 border-t border-slate-200">
          {page > 1 && (
            <Link
              href={`/community?page=${page - 1}${
                activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : ''
              }`}
              className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              &larr; Previous Page
            </Link>
          )}
          <span className="text-xs font-bold text-slate-500 px-3">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/community?page=${page + 1}${
                activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : ''
              }`}
              className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Next Page &rarr;
            </Link>
          )}
        </div>
      )}

      <CreateThreadModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <SyncDeviceModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
      />
    </div>
  );
}
