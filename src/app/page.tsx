'use client';

import { AWARENESS_PILLARS } from '@/config/constants';

/**
 * Clean & Minimalist Diabetes Awareness & Educational Campaign Home Page Component.
 *
 * @usecase Focuses purely on awareness and number-tracking education to prevent devastating diabetes complications.
 * @param None Page component receives no props.
 * @dependencies AWARENESS_PILLARS constants.
 * @returns {JSX.Element} Rendered clean, elegant awareness landing page.
 */
export default function HomePage() {
  return (
    <div className="space-y-20 py-8">
      {/* Clean Hero Awareness Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <span className="inline-block bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200">
          💡 Diabetes Awareness & Prevention Campaign
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Awareness and keeping track of your numbers will save you from <span className="text-rose-600 underline decoration-rose-300">devastating complications</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Diabetes is a silent killer that thrives when ignored. Because early high blood sugar causes no pain, millions live in status-quo comfort while irreversible vascular, kidney, and nerve damage develops beneath the surface.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <a
            href="#numbers"
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-slate-900/20 transition-all text-base"
          >
            Know Your Target Numbers
          </a>
          <a
            href="#awareness"
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 px-8 py-3.5 rounded-xl font-bold border border-teal-200 transition-all text-base"
          >
            Why Status Quo Kills &rarr;
          </a>
        </div>
      </section>

      {/* Target Numbers Dashboard Card Showcase */}
      <section id="numbers" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">
            The 3 Essential Numbers You Must Track
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Regularly tracking these metrics exposes hidden blood sugar spikes long before permanent organ damage occurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Metric 1: HbA1c */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">3-Month Average</span>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">Key Indicator</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">&lt; 5.7%</div>
              <h3 className="font-bold text-slate-800 text-lg">HbA1c Blood Level</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measures your average blood glucose over the past 90 days. A level above 6.5% indicates diabetes, while 5.7%–6.4% flags reversible prediabetes.
            </p>
          </div>

          {/* Metric 2: Fasting Blood Sugar */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">Fasting Baseline</span>
              <span className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">Daily Metric</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">70-99 <span className="text-base font-medium text-slate-500">mg/dL</span></div>
              <h3 className="font-bold text-slate-800 text-lg">Fasting Blood Glucose</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measured first thing in the morning before eating. Catching fasting glucose above 100 mg/dL early gives you time to reverse progression.
            </p>
          </div>

          {/* Metric 3: Post-Meal Peak */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">2 Hours Post-Meal</span>
              <span className="bg-rose-50 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">Spike Warning</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">&lt; 140 <span className="text-base font-medium text-slate-500">mg/dL</span></div>
              <h3 className="font-bold text-slate-800 text-lg">Postprandial Glucose</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measures blood sugar 2 hours after meals. Preventing post-meal glucose surges protects small blood vessels from oxidative stress.
            </p>
          </div>
        </div>
      </section>

      {/* Awareness Pillars Grid */}
      <section id="awareness" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Diabetes Thrives in Status-Quo Neglect
          </h2>
          <p className="text-slate-600 text-lg">
            Relying on how you "feel" is a dangerous trap. High blood sugar is silent until major complications arise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AWARENESS_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-slate-900 text-white rounded-2xl p-8 shadow-md flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{pillar.icon}</span>
                  <span className="bg-teal-900/80 text-teal-300 text-xs font-bold px-3 py-1 rounded-full border border-teal-700">
                    {pillar.stat}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">{pillar.subtitle}</p>
                <p className="text-sm text-slate-300 leading-relaxed">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subtle Symptoms & Warning Signs */}
      <section id="education" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Subtle Red Flags You Should Never Ignore
          </h2>
          <p className="text-slate-600 text-base">
            Early high blood sugar leaves quiet signals. Pay close attention if you notice any of these signs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">🚰</div>
            <h3 className="font-bold text-slate-900 text-base">Unquenchable Thirst</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Excess sugar pulls fluids from tissues, causing persistent thirst despite drinking water.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">💤</div>
            <h3 className="font-bold text-slate-900 text-base">Unexplained Fatigue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When cells resist insulin, glucose cannot enter cells, leaving you drained of energy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">👁️</div>
            <h3 className="font-bold text-slate-900 text-base">Intermittent Blurry Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Glucose fluctuations swell the eye lens, causing temporary focus and vision shifts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="text-3xl">🩹</div>
            <h3 className="font-bold text-slate-900 text-base">Slow Healing Cuts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High blood sugar impairs micro-circulation and weakens white blood cell immunity.
            </p>
          </div>
        </div>
      </section>

      {/* Campaign Call-to-Action Lead Capture */}
      <section id="campaign" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 shadow-xl border border-slate-800">
          <span className="text-teal-400 text-xs font-bold uppercase tracking-widest bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
            Take Proactive Control Today
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Track Your Numbers. Prevent Complications.
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base leading-relaxed">
            Join our Diabetes Awareness initiative to receive free educational cheat sheets, HbA1c log templates, and dietary insights.
          </p>

          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-2" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              required
              className="px-4 py-3 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 flex-grow"
            />
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md"
            >
              Get Free Guides
            </button>
          </form>
          <p className="text-xs text-slate-400">100% free educational resources. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
