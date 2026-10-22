'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ResolvedRoadmapStep, ResolvedResource } from '@/services/learning/roadmapService';
import { ILearningResource } from '@/types/learning';
import EmailCapture from '@/components/common/EmailCapture';
import ClinicalSafetyBox from '@/components/common/ClinicalSafetyBox';
import { dispatchRoadmapStepClick } from '@/analytics';

export interface LearningRoadmapSectionProps {
  steps: ResolvedRoadmapStep[];
  edition?: 'global' | 'ph';
  onPlayResource?: (resource: ILearningResource) => void;
  className?: string;
}

const STORAGE_KEY_COMPLETED = 'bts_completed_roadmap_resources';

export default function LearningRoadmapSection({
  steps,
  edition = 'global',
  onPlayResource,
  className = '',
}: LearningRoadmapSectionProps): React.JSX.Element {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);
  const [activeStepId, setActiveStepId] = useState<string>(steps[0]?.step.id || 'understand');

  // Load completed resources from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPLETED);
      if (stored) {
        setCompletedSlugs(JSON.parse(stored));
      }
    } catch {
      // localStorage may be disabled in private browsing or sandbox
    }
  }, []);

  const toggleResourceCompleted = (slug: string, e: React.MouseEvent | React.ChangeEvent) => {
    e.stopPropagation();
    setCompletedSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(next));
      } catch {
        // Handle storage quota or private mode
      }
      return next;
    });
  };

  const handleStepClick = (step: ResolvedRoadmapStep) => {
    setActiveStepId(step.step.id);
    dispatchRoadmapStepClick({
      step_number: step.step.order,
      step_slug: step.step.id,
      edition: edition || 'global',
    });
  };

  const handleResourceCardClick = (resource: ResolvedResource, step: ResolvedRoadmapStep) => {
    dispatchRoadmapStepClick({
      step_number: step.step.order,
      step_slug: step.step.id,
      edition: edition || 'global',
    });
    if (onPlayResource) {
      onPlayResource(resource);
    }
  };

  const totalResources = steps.reduce((acc, curr) => acc + curr.resources.length, 0);
  const totalCompleted = completedSlugs.filter((slug) =>
    steps.some((s) => s.resources.some((r) => r.slug === slug))
  ).length;
  const progressPercentage = totalResources > 0 ? Math.round((totalCompleted / totalResources) * 100) : 0;

  const isStarterPackEnabled = process.env.NEXT_PUBLIC_FLAG_STARTER_PACK === 'true';

  return (
    <section
      aria-label="Guided 5-Step Learning Roadmap"
      className={`space-y-8 bg-gradient-to-b from-purple-50/50 via-slate-50 to-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-purple-100 shadow-sm ${className}`}
    >
      {/* Roadmap Header & Progress Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-purple-100/80">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-bold uppercase tracking-wider mb-2">
            <span>🗺️</span> Start Here Curriculum
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            5 Steps to Understand &amp; Reverse Insulin Resistance
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            A guided self-recovery sequence curated from independent clinical lectures. Complete the steps in order before exploring the deep archive.
          </p>
        </div>

        {/* Progress Badge */}
        <div className="bg-white px-4 py-3 rounded-2xl border border-purple-200/80 shadow-xs w-full md:w-auto flex-shrink-0">
          <div className="flex items-center justify-between gap-4 text-xs font-bold text-slate-700">
            <span>Roadmap Progress</span>
            <span className="text-purple-700 font-extrabold">{totalCompleted} / {totalResources} Done</span>
          </div>
          <div className="w-full md:w-48 bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 5 Step Sequential Cards */}
      <div className="space-y-6">
        {steps.map((stepItem, index) => {
          const { step, resources } = stepItem;
          const isStepActive = activeStepId === step.id;
          const stepCompletedCount = resources.filter((r) => completedSlugs.includes(r.slug)).length;
          const isStepFullyDone = stepCompletedCount === resources.length && resources.length > 0;

          return (
            <React.Fragment key={step.id}>
              {/* Step Card */}
              <article
                tabIndex={0}
                role="region"
                aria-label={`Step ${step.order}: ${step.title}`}
                onClick={() => handleStepClick(stepItem)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleStepClick(stepItem);
                  }
                }}
                className={`transition-all rounded-3xl p-5 sm:p-6 border focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer ${
                  isStepActive
                    ? 'bg-white border-purple-300 shadow-md ring-1 ring-purple-200'
                    : 'bg-white/80 border-slate-200 hover:border-purple-200 hover:bg-white shadow-xs'
                }`}
              >
                {/* Step Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm transition-colors ${
                        isStepFullyDone
                          ? 'bg-emerald-600 text-white'
                          : isStepActive
                          ? 'bg-purple-700 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {isStepFullyDone ? '✓' : step.order}
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                        Step {step.order}: {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Goal: {step.goal}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isStepFullyDone ? (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                        <span>✓</span> Step Completed
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                        {stepCompletedCount} of {resources.length} completed
                      </span>
                    )}

                    <Link
                      href={`/learn/roadmap/${step.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl transition-colors border border-purple-200/60 inline-flex items-center gap-1"
                    >
                      <span>Share Step</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>

                {/* Resource Cards Grid for this step */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {resources.map((resource) => {
                    const isDone = completedSlugs.includes(resource.slug);

                    return (
                      <div
                        key={resource.slug}
                        data-testid={`roadmap-resource-${resource.slug}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResourceCardClick(resource, stepItem);
                        }}
                        className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-50/30 border-emerald-200/80'
                            : 'bg-slate-50 hover:bg-purple-50/40 border-slate-200 hover:border-purple-200 shadow-xs'
                        }`}
                      >
                        <div>
                          {/* Thumbnail with Play Trigger */}
                          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 mb-3 shadow-xs">
                            {resource.thumbnailUrl ? (
                              <Image
                                src={resource.thumbnailUrl}
                                alt={resource.title}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-purple-900/20 text-slate-400">
                                <span>▶ Video</span>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <span className="w-10 h-10 rounded-full bg-purple-700/90 text-white flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition-transform">
                                ▶
                              </span>
                            </div>
                            {resource.duration && (
                              <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                                {resource.duration}
                              </span>
                            )}
                          </div>

                          {/* Resource Title & Authority */}
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-purple-900 transition-colors line-clamp-2 leading-snug">
                            {resource.title}
                          </h4>
                          <p className="text-xs font-semibold text-slate-600 mt-1 flex items-center gap-1.5">
                            <span className="text-purple-600">👤</span>
                            <span>{resource.authorityName || 'Independent Clinician'}</span>
                          </p>

                          {/* Edition Note */}
                          {resource.editionNote && (
                            <p className="text-xs text-slate-600 italic mt-2 bg-white/80 p-2 rounded-xl border border-purple-100/70 leading-relaxed">
                              💡 {resource.editionNote}
                            </p>
                          )}
                        </div>

                        {/* Card Bottom: Checkbox */}
                        <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <label
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none"
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={(e) => toggleResourceCompleted(resource.slug, e)}
                              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                              aria-label={`Mark "${resource.title}" as completed`}
                            />
                            <span className={isDone ? 'text-emerald-800 font-bold' : 'text-slate-600'}>
                              {isDone ? 'Completed' : 'Mark as done'}
                            </span>
                          </label>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResourceCardClick(resource, stepItem);
                            }}
                            className="text-xs font-bold text-purple-700 group-hover:text-purple-900 inline-flex items-center gap-1"
                          >
                            <span>Watch lecture</span>
                            <span>▶</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </article>

              {/* SPEC REQUIREMENT: Email capture immediately after Step 2 */}
              {step.order === 2 && (
                <div data-testid="learn-roadmap-email-capture" className="my-6">
                  <EmailCapture
                    source="learn-roadmap"
                    edition={edition}
                    title="Keep Your Roadmap Progress &amp; Download Free Fasting Safety Guide"
                    subtitle="Save your completed curriculum trajectory and receive our dietitian-reviewed checklist on fasting glucose trajectories and insulin warning markers."
                    buttonText="Send Me My Recovery Protocol"
                  />
                </div>
              )}

              {/* SPEC REQUIREMENT: Clinical Safety Notice immediately before Step 5 */}
              {step.order === 4 && (
                <div data-testid="learn-roadmap-safety-notice" className="my-6">
                  <ClinicalSafetyBox variant="medication" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* SPEC REQUIREMENT: Hidden placeholder slot for Starter Pack call to action */}
      {isStarterPackEnabled && (
        <div
          data-testid="starter-pack-slot"
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 text-center space-y-3"
        >
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            Starter Pack Companion
          </span>
          <h3 className="text-xl font-extrabold text-slate-900">
            Filipino Metabolic Starter Pack (₱299)
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Practical 30-day Filipino meal plan, glucose logging templates, and dietitian-reviewed doctor question list.
          </p>
          <Link
            href="/ph/starter-pack"
            className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-sm transition-colors"
          >
            Claim Starter Pack
          </Link>
        </div>
      )}
    </section>
  );
}
