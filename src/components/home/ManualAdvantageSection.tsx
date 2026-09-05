import React from 'react';
import { AWARENESS_PILLARS } from '@/config/constants';

/**
 * Manual Advantage & Wealth Protection Section.
 *
 * @usecase Frames manual finger-prick logging as a smart, cost-saving wealth protection feature compared to expensive CGMs.
 * @param None Component takes no props.
 * @dependencies AWARENESS_PILLARS from constants, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered Manual Advantage Section.
 */
export default function ManualAdvantageSection(): React.JSX.Element {
  return (
    <section
      id="awareness"
      className="min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-16 py-8 sm:py-12"
    >
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3.5 py-1 rounded-full border border-teal-200">
          💰 The Smart Manual Advantage
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          No Expensive Sensors. No Hidden Fees. Just Smart Data.
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Continuous Glucose Monitors (CGMs) are excellent, but they cost thousands of pesos every month—money that belongs in your family&apos;s budget.
        </p>
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
          GlycoSense is engineered for maximum cost-efficiency. By manually entering your standard finger-prick readings, weight, and blood pressure, our AI charts your trends for you—giving you the same powerful metabolic insights as expensive medical tech using affordable tools you already own.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {AWARENESS_PILLARS.map((pillar) => (
          <div
            key={pillar.id}
            className="bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel text-white rounded-3xl p-8 shadow-xl border border-white/20 flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform duration-300"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{pillar.icon}</span>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                  {pillar.stat}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
              <p className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">{pillar.subtitle}</p>
              <p className="text-sm text-purple-100/90 leading-relaxed">{pillar.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
