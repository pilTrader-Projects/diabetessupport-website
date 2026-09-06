import React from 'react';
import Link from 'next/link';
import { IThread } from '@/types/community';

interface ThreadCardProps {
  thread: IThread;
}

/**
 * Clean Feed Card Component for Community Topics.
 *
 * @usecase Displays thread summary, author badge, category tag, replies count, and relative timestamp.
 * @dependencies IThread interface, Next.js Link.
 * @param {ThreadCardProps} props Thread entity data.
 * @returns {JSX.Element} Rendered thread item card.
 */
export default function ThreadCard({ thread }: ThreadCardProps) {
  const formattedDate = thread.createdAt
    ? new Date(thread.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <article className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-300 transition-all p-5 flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-100">
            {thread.category}
          </span>
          <span className="text-slate-400 font-semibold">{formattedDate}</span>
        </div>

        <h2 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-2 hover:text-teal-700 transition-colors">
          <Link href={`/community/${thread.slug}`}>{thread.title}</Link>
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {thread.content.replace(/<[^>]*>?/gm, '')}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-700">
          <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
            {thread.authorAlias.charAt(0).toUpperCase()}
          </span>
          <span className="truncate max-w-[120px]">{thread.authorAlias}</span>
          <span className="text-slate-400 font-normal">{thread.authorTag}</span>
        </div>

        <div className="flex items-center space-x-3 text-slate-500 font-semibold">
          <span className="flex items-center space-x-1">
            <span>💬</span>
            <span>{thread.repliesCount}</span>
          </span>
          <Link
            href={`/community/${thread.slug}`}
            className="font-bold text-teal-700 hover:text-teal-900"
          >
            Join Discussion &rarr;
          </Link>
        </div>
      </div>
    </article>
  );
}
