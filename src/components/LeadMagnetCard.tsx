'use client';

import React from 'react';
import Link from 'next/link';

export interface LeadMagnetCardProps {
  title?: string;
  subtitle?: string;
  source?: string;
}

/**
 * GlycoSense App Promotional Card Component.
 *
 * @usecase Promotes the GlycoSense Preventive Glucose & Lifestyle Intelligence App with direct access link to /get-glycosense.
 * @param {LeadMagnetCardProps} props Custom parameters.
 * @returns {JSX.Element} Rendered app promotional card container.
 */
export default function LeadMagnetCard({
  title = 'GlycoSense — Free Preventive Glucose & Lifestyle Intelligence App',
  subtitle = 'Take proactive control over your metabolic health today. Effortlessly track your glucose readings, blood pressure, meals, weight, and medications for free, while our AI Health Companion analyzes your habits to deliver personalized preventive insights.',
}: LeadMagnetCardProps) {
  return (
    <div className="my-10 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-teal-800 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Feature Bullet Area */}
      <div className="lg:col-span-7 p-8 sm:p-10 bg-gradient-to-br from-teal-950 to-slate-950 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-teal-900/60">
        <div className="space-y-4">
          <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
            ⚡️ 100% Free Health Monitoring App
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {title}
          </h3>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            {subtitle}
          </p>

          <ul className="space-y-3.5 pt-2 text-sm text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base mt-0.5">✓</span>
              <span><strong>Free Multi-Metric Tracking:</strong> Log glucose, blood pressure, meals, weight, and medications in one app.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base mt-0.5">✓</span>
              <span><strong>AI Health Companion & Agent:</strong> Intelligent pattern recognition automatically analyzes daily habits to reveal blood sugar triggers.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base mt-0.5">✓</span>
              <span><strong>Preventive Insights & Control:</strong> Receive personalized recommendations and preventive measures tailored to your observed patterns.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-teal-900/60 text-xs text-teal-300/70 flex items-center gap-2">
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <span>100% Free Tool • Joined by 15,000+ proactive users</span>
        </div>
      </div>

      {/* Right CTA Button Box */}
      <div className="lg:col-span-5 p-8 sm:p-10 bg-slate-900/90 flex flex-col justify-center items-center text-center space-y-6">
        <div className="space-y-2">
          <span className="text-4xl">📱</span>
          <h4 className="text-xl font-extrabold text-white">Start Monitoring Today</h4>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Instant free access to track your vitals and receive real-time AI health insights.
          </p>
        </div>

        <Link
          href="/get-glycosense"
          className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
        >
          <span>Get Free Access to GlycoSense App</span>
          <span className="text-lg">➔</span>
        </Link>

        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <span>🔒</span>
          <span>100% Free Monitoring App • Instant Access</span>
        </p>
      </div>
    </div>
  );
}
