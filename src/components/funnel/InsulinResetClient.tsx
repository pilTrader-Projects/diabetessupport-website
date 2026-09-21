'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SymptomChecklist from '@/components/funnel/SymptomChecklist';
import LeadCaptureForm from '@/components/funnel/LeadCaptureForm';

/**
 * Client-Side Interactive Funnel Container for the Insulin Reset Landing Page.
 *
 * @usecase Bridges the interactive symptom self-check checklist with the lead capture form in strict alignment with the site's global slate-50 and brand design system.
 * @returns {JSX.Element} Interactive landing page layout.
 */
export default function InsulinResetClient(): React.JSX.Element {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const handleToggleSymptom = (symptomTitle: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomTitle)
        ? prev.filter((item) => item !== symptomTitle)
        : [...prev, symptomTitle]
    );
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('lead-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Above-The-Fold Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-6">
        <span className="inline-block bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-300 shadow-xs">
          🧬 Dr. Benjamin Bikman Metabolic Insight
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Your &ldquo;Normal&rdquo; Blood Sugar Test is a{' '}
          <span className="text-rose-600 underline decoration-rose-300">
            Lie.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Your body can hide a crumbling metabolism for 10 to 15 years by forcing your pancreas to work overtime. Discover the single, invisible hormone that is silently making you sick, fat, and tired—long before it shows up on a standard doctor&apos;s test.
        </p>

        {/* Above-the-fold Primary CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleScrollToForm}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-black text-base sm:text-lg px-8 py-4 sm:py-4.5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
          >
            <span>Get the Free 3-Page Cheat Sheet</span>
            <span className="text-xl">↓</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          ⚡ 100% Free 3-Page PDF • Instant Download • No Prescription Needed
        </p>
      </section>

      {/* Section 1: Interactive Self-Check Checklist */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <SymptomChecklist
          selectedSymptoms={selectedSymptoms}
          onToggleSymptom={handleToggleSymptom}
        />
      </section>

      {/* Section 2: The Hook Bullet Points */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <span className="inline-block bg-teal-100 text-teal-900 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-teal-200">
            📑 Metabolic Reset Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What&apos;s Inside This Free 3-Page Cheat Sheet:
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Distilled from decades of clinical insulin physiology research into simple, actionable steps you can apply at your next meal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-3xl">🔍</span>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                Module 1
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                The Glucose Illusion
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Why tracking blood sugar alone lets the real killer slip through the cracks. Learn how insulin spikes to toxic heights decades before fasting glucose rises.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-teal-700">
              ✓ Page 1 Breakdown
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-3xl">🫀</span>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                Module 2
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                The Organ Wrecking Ball
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                How chronic high insulin silently hardens your arteries and stalls your cellular energy, locking body fat in place regardless of calorie counting.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-teal-700">
              ✓ Page 2 Insights
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-3xl">⚡</span>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
                Module 3
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                The 4 Golden Rules
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Simple, immediate nutritional shifts you can make at home tonight—without a medical prescription—to flip your body back into fat-burning mode.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-teal-700">
              ✓ Page 3 Action Plan
            </div>
          </div>
        </div>
      </section>

      {/* Scientific Background / E-E-A-T Authority Box */}
      <section className="bg-slate-100 border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto space-y-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🔬</span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Grounding in Dr. Benjamin Bikman&apos;s Metabolic Science
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Dr. Benjamin Bikman, a renowned bioenergetics professor and laboratory scientist, has demonstrated that hyperinsulinemia is the root driver of metabolic dysfunction. Conventional checkups measure glucose—the very last marker to deteriorate. This protocol equips you with the metrics and nutritional rules to stop hyperinsulinemia in its tracks.
        </p>
      </section>

      {/* Lead Capture Form Section */}
      <section className="max-w-2xl mx-auto">
        <LeadCaptureForm
          symptomsChecked={selectedSymptoms}
          source="insulin_reset_landing_page"
        />
      </section>

      {/* Back Link Footer */}
      <div className="text-center pt-4 border-t border-slate-200">
        <Link href="/blog" className="text-sm font-bold text-teal-700 hover:text-teal-900">
          &larr; Browse All Diabetes Educational Articles
        </Link>
      </div>
    </div>
  );
}
