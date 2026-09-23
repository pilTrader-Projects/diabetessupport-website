'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import SymptomChecklist from '@/components/funnel/SymptomChecklist';
import LeadCaptureForm from '@/components/funnel/LeadCaptureForm';
import { CAMPAIGN_CODES } from '@/config/leadConfig';

/**
 * Client-Side Interactive Funnel Container for the Insulin Reset Landing Page.
 *
 * @usecase Bridges the interactive symptom self-check checklist with the lead capture form for "The Hidden Metabolic Clock" 8-page educational guide.
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
          🧬 Metabolic Health Education &bull; Filipino Context
        </span>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
          Why &ldquo;Normal&rdquo; Blood Sugar{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600">
            Isn&apos;t the Whole Story.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Your body can spend years compensating for insulin resistance before fasting blood sugar reaches a diabetic threshold. Learn how your energy management system works, recognize early physical warning clues, and get the practical framework designed for the Filipino context.
        </p>

        {/* Above-the-fold Primary CTA Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleScrollToForm}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 hover:from-blue-800 hover:via-purple-800 hover:to-pink-700 text-white font-black text-base sm:text-lg px-8 py-4 sm:py-4.5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 border border-white/20"
          >
            <span>Get the Free 8-Page Guide</span>
            <span className="text-xl">&darr;</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          ⚡ 100% Free 8-Page PDF &bull; Instant Download &bull; Filipino Context
        </p>
      </section>

      {/* Section 1: Interactive Self-Check Checklist */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <SymptomChecklist
          selectedSymptoms={selectedSymptoms}
          onToggleSymptom={handleToggleSymptom}
        />
      </section>

      {/* Section 2: What's Inside The Free 8-Page Guide */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3">
          <span className="inline-block bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-indigo-200">
            📑 The Hidden Metabolic Clock
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            What&apos;s Inside This Free 8-Page Guide:
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A practical introduction to insulin resistance, metabolic compensation, and early warning signals—specifically written for Filipino households.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-purple-100/90 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition-all">
            <div className="space-y-3">
              <span className="text-3xl">🔄</span>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                Steps 1–3
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Energy Management System
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                How insulin acts as your body&apos;s energy traffic-control system. Understand the compensation phase where the pancreas works overtime to keep glucose normal while resistance silently deepens.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-indigo-700">
              ✓ Pages 2–3 &bull; Mechanism &amp; Compensation
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-purple-100/90 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition-all">
            <div className="space-y-3">
              <span className="text-3xl">🔍</span>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-md">
                Steps 4–6
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                7 Warning Clues Beyond Glucose
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Why blood glucose is just one piece of the picture. Learn the physical signals: waist circumference, skin tags, acanthosis nigricans, blood pressure, lipids, and liver fat (MASLD).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-purple-700">
              ✓ Pages 4–5 &bull; Trajectory &amp; Clues
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-purple-100/90 shadow-sm space-y-4 flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition-all">
            <div className="space-y-3">
              <span className="text-3xl">🇵🇭</span>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-pink-800 bg-pink-50 border border-pink-200 px-2.5 py-1 rounded-md">
                Step 7 &amp; Action Plan
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                The Filipino Metabolic Reality
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Carbohydrates are part of Filipino culture and family love. The goal is not to declare war on rice, but to adopt a sustainable protocol: Measure &rarr; Understand &rarr; Intervene &rarr; Monitor &rarr; Adjust.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs font-bold text-pink-700">
              ✓ Pages 6–7 &bull; Practical Action Framework
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
          This report was developed around the insulin-resistance and metabolic-health framework explored in{' '}
          <a
            href="https://link.amazon/B03KBSMOg"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="font-semibold text-teal-700 hover:text-teal-900 underline decoration-teal-400 hover:decoration-teal-600 transition-colors"
          >
            <em>Why We Get Sick</em> by Dr. Benjamin Bikman, PhD
          </a>
          . It examines how impaired glucose regulation begins years before standard diagnosis, and how recognizing early warning clues gives families the power to intervene before a crisis occurs.
        </p>
      </section>

      {/* Lead Capture Form Section */}
      <section className="max-w-2xl mx-auto">
        <LeadCaptureForm
          symptomsChecked={selectedSymptoms}
          source={CAMPAIGN_CODES.INSULIN_RESET_FUNNEL}
        />
      </section>

      {/* Back Link Footer */}
      <div className="text-center pt-4 border-t border-slate-200">
        <Link href="/blog" className="text-sm font-bold text-indigo-700 hover:text-indigo-900">
          &larr; Browse All Diabetes Educational Articles
        </Link>
      </div>
    </div>
  );
}
