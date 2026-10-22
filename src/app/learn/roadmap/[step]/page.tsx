import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ROADMAP_STEPS,
  getRoadmapStepConfig,
  getAdjacentSteps,
  normalizeEdition,
  StepId,
} from '@/config/roadmap';
import { getRoadmapStepById } from '@/services/learning/roadmapService';
import { buildMetadata } from '@/lib/seo';
import StepDetailClient from '@/components/learning/StepDetailClient';
import ClinicalSafetyBox from '@/components/common/ClinicalSafetyBox';
import EmailCapture from '@/components/common/EmailCapture';

export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour (ISR)

interface RoadmapStepPageProps {
  params: Promise<{ step: string }>;
  searchParams?: Promise<{ edition?: string }>;
}

/**
 * Pre-renders all 5 static roadmap step routes at build time for optimal TTFB and SEO indexation.
 */
export async function generateStaticParams(): Promise<Array<{ step: string }>> {
  return ROADMAP_STEPS.map((step) => ({
    step: step.id,
  }));
}

/**
 * Generates dynamic, SEO-optimized metadata and OpenGraph tags for individual curriculum steps.
 */
export async function generateMetadata(props: RoadmapStepPageProps): Promise<Metadata> {
  const { step } = await props.params;
  const stepConfig = getRoadmapStepConfig(step);

  if (!stepConfig) {
    return buildMetadata({
      title: 'Step Not Found | 5-Step Diabetes Learning Roadmap',
      description: 'The requested roadmap step could not be found. Explore our 5-step curriculum.',
      path: '/learn',
    });
  }

  const title = `Step ${stepConfig.order}: ${stepConfig.title} | 5-Step Diabetes Roadmap`;
  const description = `${stepConfig.goal} Explore curated video lectures and clinical evidence.`;

  return buildMetadata({
    title,
    description,
    path: `/learn/roadmap/${stepConfig.id}`,
    type: 'website',
  });
}

/**
 * Individual Shareable Roadmap Step Page Server Component.
 *
 * @usecase Serves static, accessible landing pages for each of the 5 guided curriculum steps
 * (/learn/roadmap/understand, /learn/roadmap/spot-signs, etc.).
 * Includes clinical safety disclaimers, interactive resource checklist, video player modal,
 * and high-converting email capture.
 */
export default async function RoadmapStepPage(props: RoadmapStepPageProps): Promise<React.JSX.Element> {
  const { step } = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const edition = normalizeEdition(searchParams?.edition);

  const stepConfig = getRoadmapStepConfig(step);
  if (!stepConfig) {
    notFound();
  }

  const resolvedStep = await getRoadmapStepById(stepConfig.id, edition);
  if (!resolvedStep) {
    notFound();
  }

  const { prev, next } = getAdjacentSteps(stepConfig.id);

  // Ensure plain JSON serialization across RSC boundary
  const sanitizedStepItem = JSON.parse(JSON.stringify(resolvedStep));
  const sanitizedPrev = prev ? JSON.parse(JSON.stringify(prev)) : null;
  const sanitizedNext = next ? JSON.parse(JSON.stringify(next)) : null;

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://beforethenumbers.org',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Learning Hub',
        item: 'https://beforethenumbers.org/learn',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Step ${stepConfig.order}: ${stepConfig.title}`,
        item: `https://beforethenumbers.org/learn/roadmap/${stepConfig.id}`,
      },
    ],
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Schema.org Breadcrumbs Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Step Banner / Hero */}
        <header className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/50 rounded-full blur-3xl -z-10 translate-x-20 -translate-y-20" />
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
              5-Step Diabetes Recovery Roadmap
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              {`Step ${stepConfig.order} of 5`}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            {`Step ${stepConfig.order}: ${stepConfig.title}`}
          </h1>

          <p className="mt-3 text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
            <span className="font-bold text-slate-900">Core Objective: </span>
            {stepConfig.goal}
          </p>
        </header>

        {/* Clinical Safety Box: Displayed prominently on Step 5 or steps with explicit safety notes */}
        {(stepConfig.safetyNote || stepConfig.id === 'stay-safe') && (
          <div data-testid="roadmap-step-safety-box" className="space-y-4">
            <ClinicalSafetyBox
              variant="medication"
              className="border-amber-300 bg-amber-50/70"
            />
            {stepConfig.safetyNote && (
              <div className="p-4 rounded-2xl bg-amber-100/60 border border-amber-300/80 text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                <span className="font-bold">{`⚠️ Step ${stepConfig.order} Safety Note: `}</span>
                {stepConfig.safetyNote}
              </div>
            )}
          </div>
        )}

        {/* Interactive Step Client Component */}
        <StepDetailClient
          stepItem={sanitizedStepItem}
          prevStep={sanitizedPrev}
          nextStep={sanitizedNext}
          edition={edition}
        />

        {/* Lead Capture Form */}
        <section aria-labelledby="step-download-heading">
          <EmailCapture
            source={`learn-roadmap-${stepConfig.id}`}
            title={`Keep Step ${stepConfig.order} Progress & Download Free Checklist`}
            subtitle="Save your completed curriculum trajectory and receive our dietitian-reviewed checklist on fasting glucose trajectories and insulin warning markers."
            buttonText="Send Me My Recovery Protocol"
          />
        </section>

        {/* Global Medical Disclaimer Footnote */}
        <footer className="text-center pt-6 border-t border-slate-200 text-xs text-slate-600 space-y-2">
          <p>
            Educational and informational purposes only. Content curated on Before the Numbers is not intended as medical advice, diagnosis, or treatment. Always consult your qualified healthcare provider before making alterations to your prescribed medication, diet, or exercise regimen.
          </p>
          <div className="flex justify-center gap-4 font-bold text-slate-600">
            <Link href="/medical-disclaimer" className="hover:text-purple-700 underline">
              Medical Disclaimer
            </Link>
            <Link href="/editorial-policy" className="hover:text-purple-700 underline">
              Editorial Policy
            </Link>
            <Link href="/privacy" className="hover:text-purple-700 underline">
              Privacy Policy
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
