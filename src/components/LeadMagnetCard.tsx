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
  subtitle = 'Take proactive control over elevated glucose levels with our quick-action daily routine guide.',
}: LeadMagnetCardProps) {
  return (
    <div className="my-10 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-teal-800 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Feature Bullet Area */}
      <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-teal-950 to-slate-950 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-teal-900/60">
        <div className="space-y-4">
          <span className="inline-block bg-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-teal-500/30">
            📑 INSTANT PDF DOWNLOAD
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {title}
          </h3>
          <p className="text-sm text-teal-100/80 leading-relaxed">
            {subtitle}
          </p>

          <ul className="space-y-3 pt-2 text-sm text-slate-200">
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base">✓</span>
              <span><strong>5 Morning Habits</strong> to reset insulin sensitivity naturally.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base">✓</span>
              <span><strong>Top 10 High-Fiber Foods</strong> that prevent post-meal sugar spikes.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base">✓</span>
              <span><strong>Fasting Glucose Log Sheet</strong> printable PDF chart.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-teal-900/60 text-xs text-teal-300/70 flex items-center gap-2">
          <span>⭐️⭐️⭐️⭐️⭐️</span>
          <span>Downloaded by 15,000+ patients & carers</span>
        </div>
      </div>

      {/* Right Form / CTA Area */}
      <div className="lg:col-span-7 p-6 sm:p-8 flex items-center">
        <div className="w-full bg-teal-950/60 border border-teal-800/80 rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="space-y-2">
            <span className="inline-block bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/30">
              🎁 FREE DOWNLOADABLE RESOURCE
            </span>
            <h4 className="text-2xl font-extrabold text-white">Get Instant Access to Your Free Copy</h4>
            <p className="text-xs text-teal-100/80 max-w-md mx-auto">
              Click the button below to get instant access to your 7-Day Diabetes Action Plan.
            </p>
          </div>

          <Link
            href="/get-glycosense"
            className="w-full py-4 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm sm:text-base rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300"
          >
            <span>Get Free Access to GlycoSense App</span>
            <span className="text-lg">➔</span>
          </Link>

          <p className="text-[11px] text-teal-300/70 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>100% Privacy Guaranteed. Unsubscribe at any time with 1-click.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
