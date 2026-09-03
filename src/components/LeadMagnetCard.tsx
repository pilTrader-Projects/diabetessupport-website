'use client';

import React from 'react';
import Link from 'next/link';

export interface LeadMagnetCardProps {
  title?: string;
  subtitle?: string;
  source?: string;
}

/**
 * Lead Magnet Promotional Card Component.
 *
 * @usecase Displays promotional resource card with direct link to /get-glycosense.
 * @param {LeadMagnetCardProps} props Custom parameters.
 * @returns {JSX.Element} Rendered promotional card container.
 */
export default function LeadMagnetCard({
  title = 'Track Your Numbers. Prevent Complications.',
  subtitle = 'Take proactive control over elevated glucose levels with our comprehensive, easy-to-use health tracking dashboard.',
}: LeadMagnetCardProps) {
  return (
    <div className="my-10 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-indigo-500/30 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Feature Bullet Area with Signature GlycoSense Indigo-Violet-Fuchsia Gradient */}
      <div className="lg:col-span-6 p-8 sm:p-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-950 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-indigo-700/40">
        <div className="space-y-4">
          <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
            🚀 INSTANT FREE APP ACCESS
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight drop-shadow-sm">
            {title}
          </h3>
          <p className="text-sm text-purple-100/90 leading-relaxed">
            {subtitle}
          </p>

          <ul className="space-y-3.5 pt-2 text-sm text-purple-50">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Smart Meal & Glucose Logger</strong> to see exactly how your food affects your blood sugar spikes in real-time.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Complete Metric Tracking</strong> to effortlessly log your weight, blood pressure, and medication updates in one place.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Actionable Progress Charts</strong> that turn your daily stats into clear, motivating health insights.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-indigo-700/40 text-xs text-purple-200/80 flex items-center gap-2">
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <span>Trusted by 15,000+ proactive users & carers</span>
        </div>
      </div>

      {/* Right Form / CTA Area */}
      <div className="lg:col-span-6 p-6 sm:p-8 flex items-center bg-slate-950">
        <div className="w-full bg-gradient-to-b from-indigo-950/80 to-slate-950 border border-indigo-800/60 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-xl">
          <div className="space-y-2">
            <span className="inline-block bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-500/30">
              🎁 FREE ACCESS FOR A LIMITED TIME
            </span>
            <h4 className="text-2xl font-extrabold text-white">Get Instant Access to Your Free Account</h4>
            <p className="text-xs text-purple-200/80 max-w-md mx-auto leading-relaxed">
              Click the button below to get ACCESS to the GlycoSense App and start rewriting your health story.
            </p>
          </div>

          <Link
            href="/get-glycosense"
            className="w-full py-4 px-6 bg-white hover:bg-slate-50 text-indigo-700 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white"
          >
            <span>Get Free Access to GlycoSense App</span>
            <span className="text-lg">➔</span>
          </Link>

          <p className="text-[11px] text-purple-300/60 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>100% Privacy Guaranteed. Safe, secure, and encrypted.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
