'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LearningAdminNavProps {
  counts?: {
    authorities?: number;
    podcasts?: number;
    resources?: number;
  };
  onRunGlobalSync?: () => void;
  isSyncingGlobal?: boolean;
}

export default function LearningAdminNav({
  counts,
  onRunGlobalSync,
  isSyncingGlobal = false,
}: LearningAdminNavProps): React.JSX.Element {
  const pathname = usePathname();

  const navItems = [
    {
      id: 'authorities',
      label: 'Doctors & Authorities',
      icon: '👨‍⚕️',
      href: '/admin/learning/authorities',
      count: counts?.authorities,
      description: 'Monitored medical doctors & specialists',
    },
    {
      id: 'podcasts',
      label: 'Podcast Shows',
      icon: '🎙️',
      href: '/admin/learning/podcasts',
      count: counts?.podcasts,
      description: 'Tracked interview channels & health podcasts',
    },
    {
      id: 'resources',
      label: 'Cataloged Resources',
      icon: '📚',
      href: '/admin/learning/resources',
      count: counts?.resources,
      description: 'Curated videos, studies, books & articles',
    },
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-md border border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-xl">
      {/* Primary Tab Navigation */}
      <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2" aria-label="Learning Hub Admin Sections">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 via-cyan-500/15 to-indigo-500/20 text-white border border-teal-500/40 shadow-sm shadow-teal-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive
                      ? 'bg-teal-500/30 text-teal-200 border border-teal-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Global Actions */}
      {onRunGlobalSync && (
        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-3">
          <button
            type="button"
            onClick={onRunGlobalSync}
            disabled={isSyncingGlobal}
            title="Triggers the automated AI syndication engine to check all channels for fresh metabolic health content"
            className="w-full md:w-auto px-3.5 py-2 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <span className={isSyncingGlobal ? 'animate-spin' : ''}>⚡</span>
            <span>{isSyncingGlobal ? 'Running AI Syndication...' : 'Run Syndication Engine'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
