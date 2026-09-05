import React from 'react';
import Link from 'next/link';

/**
 * Core Metrics Section Component displaying clinically accurate target thresholds.
 *
 * @usecase Educates users on baseline metrics (HbA1c, Fasting Glucose, Postprandial Glucose, and Urinalysis/BP) with 3-column color-coded pills.
 * @param None Component takes no props.
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered Core Metrics Section.
 */
export default function CoreMetricsSection(): React.JSX.Element {
  return (
    <section
      id="progression"
      className="min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-16 py-8 sm:py-12"
    >
      <div className="text-center space-y-3">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
          Accurate Clinical Thresholds
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          The Metrics That Protect Your Future
        </h2>
        <p className="text-slate-600 max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
          You cannot manage what you do not measure. GlycoSense uses advanced AI to analyze the vital health markers you log manually, giving you a clear picture of your metabolic health.
        </p>
      </div>

      <div id="numbers" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* HbA1c Card - Green Pill */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-100 text-emerald-900 text-xs font-black px-3.5 py-1.5 rounded-full border border-emerald-300 shadow-sm">
                🟢 3-Month Baseline
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">90-Day Avg</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">&lt; 5.7%</div>
              <h3 className="font-bold text-slate-800 text-lg">HbA1c Blood Level</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measures your true baseline over 90 days. Catching this between <strong>5.7% and 6.4%</strong> flags prediabetes—the golden window where you can completely reverse the condition before it becomes permanent.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
            <span>✓</span>
            <span>Golden Window for Full Reversibility</span>
          </div>
        </div>

        {/* Fasting Blood Glucose Card - Yellow Pill */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 hover:border-amber-400 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-amber-100 text-amber-950 text-xs font-black px-3.5 py-1.5 rounded-full border border-amber-300 shadow-sm">
                🟡 Morning Wake-Up
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">Daily Metric</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">70–99 <span className="text-base font-medium text-slate-500">mg/dL</span></div>
              <h3 className="font-bold text-slate-800 text-lg">Fasting Blood Glucose</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your first test in the morning. If this number creeps to <strong>≥ 100 mg/dL</strong>, your cells are beginning to resist insulin and store excess sugar in your liver.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-amber-800 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>Early Insulin Resistance Flag at ≥ 100 mg/dL</span>
          </div>
        </div>

        {/* Post-Meal Glucose Card - Red Pill */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4 hover:border-rose-400 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="bg-rose-100 text-rose-950 text-xs font-black px-3.5 py-1.5 rounded-full border border-rose-300 shadow-sm">
                🔴 2-Hr Spike Check
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase">After Meals</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">&lt; 140 <span className="text-base font-medium text-slate-500">mg/dL</span></div>
              <h3 className="font-bold text-slate-800 text-lg">Post-Meal Glucose</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Tested 2 hours after your first bite. Readings consistently <strong>above 140 mg/dL</strong> are a Spike Warning, signaling that your meal overwhelmed your metabolism.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-rose-700 flex items-center gap-1.5">
            <span>⚡</span>
            <span>Spike Warning Trigger at &gt; 140 mg/dL</span>
          </div>
        </div>
      </div>

      {/* Full Health Picture Callout (Physician's Aide & Data Vault) */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-teal-800/40 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xl">🩺</span>
              <h3 className="text-lg sm:text-xl font-bold text-white">The Full Health Picture: Organs &amp; Blood Pressure</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              Easily track everyday vitals like blood pressure and active medications. You can also use GlycoSense as a personal digital vault for lab reports or annual checkups. Our AI instantly converts your manual logs into a structured, doctor-ready report—giving your physician the perfect data asset to spot hidden metabolic trends long before dialysis ever enters the conversation.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-block bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-sm shadow-sm">
              👨‍⚕️ AI Physician’s Aide
            </span>
          </div>
        </div>

        {/* Doctor's PDF Report Preview Action Teaser */}
        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="space-y-1">
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">Clinical Collaboration Asset</span>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly generate a structured statistical brief of your blood pressure curves and blood sugar logs to hand straight to your doctor at your next routine checkup.
            </p>
          </div>
          <Link
            href="#campaign"
            className="flex-shrink-0 px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <span>📄 Preview Doctor-Ready PDF Export</span>
            <span>➔</span>
          </Link>
        </div>
      </div>

      {/* Contextual SaMD & Regulatory Operational Note */}
      <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 text-center max-w-4xl mx-auto shadow-sm">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong className="text-slate-800">Operational Note:</strong> GlycoSense AI features provide descriptive statistical data trends for personal logging purposes only. It is not an FDA-cleared diagnostic device, does not directly evaluate organ function or monitor drug interactions, and should not be used as a substitute for consulting an endocrinologist, nephrologist, or primary care physician.
        </p>
      </div>
    </section>
  );
}
