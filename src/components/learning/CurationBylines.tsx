import React from 'react';
import { EvidenceLevel } from '@/types/learning';

interface CurationBylinesProps {
  authorityName: string;
  authorityTitle?: string;
  authorityAvatar?: string;
  editorialDesk?: string;
  clinicalReviewer?: string;
  evidenceLevel?: EvidenceLevel;
  className?: string;
  compact?: boolean;
}

/**
 * 3-Layer Curation Authorship Bylines Component (Issue #44).
 *
 * @usecase Clarifies that materials are primary medical authority findings, curated by
 * the editorial desk, and verified for clinical safety without claiming prescriptive advice.
 * @dependencies EvidenceLevel type from types/learning.
 */
export default function CurationBylines({
  authorityName,
  authorityTitle,
  authorityAvatar,
  editorialDesk = 'Before the Numbers Editorial Desk',
  clinicalReviewer = 'Before the Numbers Clinical Review Desk',
  evidenceLevel,
  className = '',
  compact = false,
}: CurationBylinesProps): React.JSX.Element {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Evidence Level Badge (if provided) */}
      {evidenceLevel && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
            <span>⚖️</span>
            <span>{evidenceLevel}</span>
          </span>
        </div>
      )}

      {/* 3-Layer Bylines Grid/List */}
      <div className={`grid ${compact ? 'grid-cols-1 gap-2' : 'grid-cols-1 sm:grid-cols-3 gap-3'} text-xs`}>
        {/* Layer 1: Primary Medical Authority */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          {authorityAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorityAvatar}
              alt={authorityName}
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0 text-sm">
              👨‍⚕️
            </div>
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Primary Authority
            </span>
            <span className="font-extrabold text-slate-900 block truncate" title={authorityName}>
              {authorityName}
            </span>
            {authorityTitle && (
              <span className="text-[11px] text-slate-500 block line-clamp-1" title={authorityTitle}>
                {authorityTitle}
              </span>
            )}
          </div>
        </div>

        {/* Layer 2: Editorial Desk */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0 text-sm">
            📝
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              2. Editorial Synthesis
            </span>
            <span className="font-semibold text-slate-800 text-[11px] leading-snug block">
              {`Curated & Synthesized by ${editorialDesk}`}
            </span>
          </div>
        </div>

        {/* Layer 3: Clinical Safety Review */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 text-sm">
            🛡️
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              3. Clinical Safety
            </span>
            <span className="font-semibold text-slate-800 text-[11px] leading-snug block">
              {`Medically Reviewed for Safety by ${clinicalReviewer}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
