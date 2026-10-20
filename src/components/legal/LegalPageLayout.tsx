import React from 'react';
import Link from 'next/link';
import LegalMarkdown from '@/components/legal/LegalMarkdown';
import { formatEffectiveDate, type LegalDocument } from '@/lib/legalContent';

const BADGE_CLASS = {
  indigo: 'bg-indigo-100 text-indigo-900 border-indigo-200',
  purple: 'bg-purple-100 text-purple-900 border-purple-200',
} as const;

/**
 * Shared layout for markdown-driven legal pages (header, rendered body, footer navigation).
 */
export default function LegalPageLayout({ doc }: { doc: LegalDocument }) {
  const { meta, body } = doc;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-slate-800">
      <header className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-6">
        <span
          className={`${BADGE_CLASS[meta.accent]} text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border inline-block`}
        >
          {meta.badge}
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">{meta.title}</h1>
        <p className="text-sm font-semibold text-slate-500">
          Last Updated: {formatEffectiveDate(meta.effectiveDate)}
          {meta.subtitle ? ` • ${meta.subtitle}` : ''}
        </p>
      </header>

      <LegalMarkdown markdown={body} />

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-teal-700">
        <Link href={meta.backHref} className="hover:underline">
          {meta.backLabel}
        </Link>
        {meta.nextHref && (
          <Link href={meta.nextHref} className="hover:underline">
            {meta.nextLabel}
          </Link>
        )}
      </div>
    </div>
  );
}
