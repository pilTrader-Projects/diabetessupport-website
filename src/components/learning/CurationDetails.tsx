import React from 'react';
import { ILearningResource } from '@/types/learning';
import ClinicalSafetyBox from '@/components/common/ClinicalSafetyBox';
import CurationBylines from '@/components/learning/CurationBylines';
import { DEFAULT_DOCTOR_QUESTIONS, resolveEvidenceLevel } from '@/lib/learningSchema';

interface CurationDetailsProps {
  resource: ILearningResource;
  className?: string;
  hideBylines?: boolean;
}

/**
 * Standardized Curation Template Component (Issue #44 Deliverable 2).
 *
 * @usecase Renders executive takeaway, core mechanisms, clinical safety box,
 * physician consultation questions, and primary literature citations.
 * @dependencies ILearningResource, ClinicalSafetyBox, CurationBylines, learningSchema.
 */
export default function CurationDetails({
  resource,
  className = '',
  hideBylines = false,
}: CurationDetailsProps): React.JSX.Element {
  const evidenceLevel = resolveEvidenceLevel(resource);
  const questions =
    resource.discussionQuestions && resource.discussionQuestions.length > 0
      ? resource.discussionQuestions
      : DEFAULT_DOCTOR_QUESTIONS;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 3-Layer Authorship Bylines */}
      {!hideBylines && (
        <CurationBylines
          authorityName={resource.authorityName}
          authorityTitle={resource.authorityTitle}
          authorityAvatar={resource.authorityAvatar}
          editorialDesk={resource.editorialDesk}
          clinicalReviewer={resource.clinicalReviewer}
          evidenceLevel={evidenceLevel}
        />
      )}

      {/* 1. Executive Scientific Takeaway (Answer-First Format) */}
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 border border-teal-200/80 rounded-2xl p-5 space-y-2 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">💡</span>
          <h3 className="text-xs font-black uppercase tracking-wider text-teal-950">
            Executive Scientific Takeaway
          </h3>
        </div>
        <p className="text-slate-800 text-sm font-medium leading-relaxed">
          {resource.summary}
        </p>
      </div>

      {/* 2. Core Biological Mechanisms */}
      {resource.keyTakeaways && resource.keyTakeaways.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔬</span>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Core Biological Mechanisms
            </h3>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {resource.keyTakeaways.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-teal-600 font-bold shrink-0">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 3. Clinical Safety Box (Medication, Fasting & Physician Oversight Warnings) */}
      <ClinicalSafetyBox variant="all" />

      {/* 4. Practical Physician Consultation Questions */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-lg">🩺</span>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Questions to Explore with Your Physician
          </h3>
        </div>
        <p className="text-[11px] text-slate-500">
          Take these discussion prompts to your next consultation to explore personalized metabolic adjustments safely:
        </p>
        <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside leading-relaxed">
          {questions.map((question, idx) => (
            <li key={idx} className="pl-1">
              <span className="font-medium text-slate-800">{question}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* 5. Primary Scientific Citations & Source Attribution */}
      <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">
          Primary Scientific Citations &amp; Source Attribution
        </h4>
        {resource.citations && resource.citations.length > 0 ? (
          <ul className="space-y-1 text-slate-600 text-[11px]">
            {resource.citations.map((cite, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-slate-400 font-mono">[{idx + 1}]</span>
                <span>{cite}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[11px] text-slate-500">
            Original lecture and clinical presentation available at:{' '}
            <a
              href={resource.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-900 font-semibold underline"
            >
              {resource.sourceUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
