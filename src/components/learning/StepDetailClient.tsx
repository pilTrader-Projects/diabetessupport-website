'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResolvedRoadmapStep, ResolvedResource } from '@/services/learning/roadmapService';
import { RoadmapStep } from '@/config/roadmap';
import { ILearningResource } from '@/types/learning';
import VideoPlayerModal from '@/components/learning/VideoPlayerModal';
import { useRoadmapProgress } from '@/hooks/useRoadmapProgress';
import { dispatchRoadmapStepClick } from '@/analytics';

export interface StepDetailClientProps {
  stepItem: ResolvedRoadmapStep;
  prevStep: RoadmapStep | null;
  nextStep: RoadmapStep | null;
  edition?: 'global' | 'ph';
}

/**
 * Interactive Client Component for Individual Shareable Roadmap Step Pages.
 *
 * @usecase Powers user interactions on /learn/roadmap/[step] including:
 * - LocalStorage-backed progress tracking ("Mark as done")
 * - Native Lite-Embed video playback modal
 * - Dynamic Prev/Next curriculum pagination
 * - Social sharing with clipboard fallback
 * - GA4 step click event telemetry
 */
export default function StepDetailClient({
  stepItem,
  prevStep,
  nextStep,
  edition = 'global',
}: StepDetailClientProps): React.JSX.Element {
  const { step, resources } = stepItem;
  const [activeVideoResource, setActiveVideoResource] = useState<ILearningResource | null>(null);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // Decoupled localStorage curriculum progress hook
  const {
    completedSlugs,
    isResourceCompleted,
    toggleResourceCompleted,
    totalResources,
    totalCompleted,
    progressPercentage,
  } = useRoadmapProgress([stepItem]);

  const isStepFullyDone = totalResources > 0 && totalCompleted === totalResources;

  const handlePlayResource = useCallback(
    (resource: ResolvedResource) => {
      dispatchRoadmapStepClick({
        step_number: step.order,
        step_slug: step.id,
        edition,
      });
      setActiveVideoResource(resource);
    },
    [step.order, step.id, edition]
  );

  const handleShareStep = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `Step ${step.order}: ${step.title} | 5-Step Diabetes Roadmap`,
      text: step.goal,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard if share cancelled or rejected
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      } catch {
        // Safe fallback
      }
    }
  }, [step.order, step.title, step.goal]);

  return (
    <div className="space-y-8" data-testid="step-detail-container">
      {/* Top Header & Breadcrumbs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <Link
          href="/learn#learning-roadmap"
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 hover:text-purple-900 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform" aria-hidden="true">
            ←
          </span>
          <span>Back to 5-Step Roadmap</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleShareStep}
            className="text-xs font-bold text-slate-700 hover:text-purple-700 bg-white hover:bg-purple-50 px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-purple-200 transition-colors shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            aria-label="Share this roadmap step"
          >
            <span>{copiedShare ? '✓ Link Copied!' : '↗ Share Step'}</span>
          </button>

          {isStepFullyDone ? (
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
              <span aria-hidden="true">✓</span> Step Complete
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {`${totalCompleted} of ${totalResources} Completed`}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span>{`Curriculum Progress for Step ${step.order}`}</span>
          <span className={progressPercentage === 100 ? 'text-emerald-700' : 'text-purple-700'}>
            {`${progressPercentage}%`}
          </span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              progressPercentage === 100 ? 'bg-emerald-500' : 'bg-purple-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Resource Cards Section */}
      <section aria-labelledby="step-resources-heading">
        <h2 id="step-resources-heading" className="text-lg font-extrabold text-slate-900 mb-4">
          {`Required Lectures & Practical Clinical Guides (${resources.length})`}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource) => {
            const isCompleted = isResourceCompleted(resource.slug);

            return (
              <article
                key={resource.slug}
                data-testid={`step-resource-${resource.slug}`}
                className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-emerald-50/25 border-emerald-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200/90 shadow-xs hover:border-purple-200'
                }`}
              >
                <div>
                  {/* Thumbnail with Click to Play */}
                  <div
                    onClick={() => handlePlayResource(resource)}
                    className="group/thumb relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-4 shadow-2xs cursor-pointer"
                  >
                    {resource.thumbnailUrl && resource.thumbnailUrl.trim().length > 0 ? (
                      <Image
                        src={resource.thumbnailUrl}
                        alt={resource.title || 'Video Lecture Thumbnail'}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple-950 text-slate-300">
                        <span className="text-xs font-bold uppercase tracking-wider">▶ Video Lecture</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/25 group-hover/thumb:bg-black/15 transition-colors flex items-center justify-center">
                      <span
                        className="w-12 h-12 rounded-full bg-purple-700/95 text-white flex items-center justify-center text-base shadow-lg group-hover/thumb:scale-110 transition-transform"
                        aria-hidden="true"
                      >
                        ▶
                      </span>
                    </div>
                    {resource.duration && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/85 text-white text-[11px] font-bold px-2 py-0.5 rounded">
                        {resource.duration}
                      </span>
                    )}
                  </div>

                  {/* Resource Title & Authority Byline */}
                  <h3
                    onClick={() => handlePlayResource(resource)}
                    className="text-base font-extrabold text-slate-900 hover:text-purple-800 transition-colors cursor-pointer leading-snug"
                  >
                    {resource.title}
                  </h3>

                  <p className="text-xs font-semibold text-slate-600 mt-1.5 flex items-center gap-1.5">
                    <span className="text-purple-600" aria-hidden="true">
                      👤
                    </span>
                    <span>{resource.authorityName || 'Independent Clinician'}</span>
                  </p>

                  {/* Summary / Core Finding */}
                  {resource.summary && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                      {resource.summary}
                    </p>
                  )}

                  {/* Localized Clinical Context Note */}
                  {resource.editionNote && (
                    <div className="mt-3 p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950 leading-relaxed font-medium">
                      <span className="font-bold mr-1">💡 Focus:</span>
                      {resource.editionNote}
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 mt-5 border-t border-slate-200/80 flex items-center justify-between">
                  <label
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleResourceCompleted(resource.slug)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      aria-label={`Mark "${resource.title}" as completed`}
                    />
                    <span className={isCompleted ? 'text-emerald-800 font-bold' : 'text-slate-600'}>
                      {isCompleted ? 'Completed' : 'Mark as done'}
                    </span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handlePlayResource(resource)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Watch lecture</span>
                    <span aria-hidden="true">▶</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Sequential Roadmap Pagination (Prev / Next Step) */}
      <nav
        aria-label="Roadmap Step Navigation"
        className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        {prevStep ? (
          <Link
            href={`/learn/roadmap/${prevStep.id}`}
            onClick={() =>
              dispatchRoadmapStepClick({
                step_number: prevStep.order,
                step_slug: prevStep.id,
                edition,
              })
            }
            className="w-full sm:w-auto flex items-center gap-3 p-4 rounded-xl border border-slate-200 hover:border-purple-300 bg-white hover:bg-purple-50/40 transition-colors group"
          >
            <span className="text-xl text-slate-400 group-hover:text-purple-700 transition-colors" aria-hidden="true">
              ←
            </span>
            <div className="text-left">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Previous Step
              </span>
              <span className="text-sm font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors">
                {`Step ${prevStep.order}: ${prevStep.title}`}
              </span>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextStep ? (
          <Link
            href={`/learn/roadmap/${nextStep.id}`}
            onClick={() =>
              dispatchRoadmapStepClick({
                step_number: nextStep.order,
                step_slug: nextStep.id,
                edition,
              })
            }
            className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 p-4 rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-colors group text-right"
          >
            <div className="text-left sm:text-right">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Next Step
              </span>
              <span className="text-sm font-extrabold text-purple-950 group-hover:text-purple-900 transition-colors">
                {`Step ${nextStep.order}: ${nextStep.title}`}
              </span>
            </div>
            <span className="text-xl text-purple-600 group-hover:translate-x-1 transition-transform" aria-hidden="true">
              →
            </span>
          </Link>
        ) : (
          <Link
            href="/learn#learning-roadmap"
            className="w-full sm:w-auto flex items-center justify-center gap-2 p-4 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors font-extrabold text-sm text-emerald-900"
          >
            <span>🎉 Congratulations! Return to Full Roadmap</span>
            <span aria-hidden="true">✓</span>
          </Link>
        )}
      </nav>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={Boolean(activeVideoResource)}
        onClose={() => setActiveVideoResource(null)}
        resource={activeVideoResource}
      />
    </div>
  );
}
