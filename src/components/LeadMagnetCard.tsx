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
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered promotional card container.
 */
export default function LeadMagnetCard({
  title = "Protect Your Family's Future. Track Your Numbers.",
  subtitle = 'Turn simple, budget-friendly manual finger-prick logs into clear, actionable health trends that help you and your doctor prevent diabetic complications.',
}: LeadMagnetCardProps): React.JSX.Element {
  return (
    <div className="my-2 sm:my-3 text-white rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel grid grid-cols-1 lg:grid-cols-12">
      {/* Left Feature Bullet Area */}
      <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-white/10">
        <div className="space-y-4">
          <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
            🛡️ ZERO-COST WEALTH PROTECTION
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
              <span><strong>Smart Meal &amp; Glucose Logger</strong>: Log what you ate alongside your 2-hour finger prick. Our AI instantly charts your personal food triggers so you know exactly which local dishes cause your blood sugar to spike.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Prescription Ledger &amp; Timeline</strong>: Maintain a permanent, organized record of your active and discontinued medications. Give your healthcare provider a completely accurate chronological history to prevent drug interaction oversights and streamline tracking.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-300 font-bold text-base mt-0.5">✓</span>
              <span><strong>Doctor-Ready PDF Summaries</strong>: Instantly export structured statistical briefs of your blood pressure curves and glucose logs to hand straight to your doctor at your next checkup.</span>
            </li>
          </ul>
        </div>

        <div className="pt-4 border-t border-white/15 text-xs text-purple-200/90 space-y-1">
          <div className="flex items-center gap-2 font-bold text-white">
            <span>⭐️⭐️⭐️⭐️⭐️</span>
            <span>Join the growing movement of Filipino family providers</span>
          </div>
          <p className="text-[11px] text-purple-200/80 leading-relaxed">
            Be part of the early wave of breadwinners taking back control of their metabolic health before complications start.
          </p>
        </div>
      </div>

      {/* Right Form / CTA Panel */}
      <div className="lg:col-span-6 p-6 sm:p-8 flex items-center">
        <div className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 space-y-6 text-center shadow-2xl">
          <div className="space-y-2">
            <span className="inline-block bg-amber-400/25 text-amber-200 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-300/40 backdrop-blur-sm">
              🎁 FREE ACCESS FOR PROVIDERS
            </span>
            <h4 className="text-2xl font-extrabold text-white">Get Instant Access to Your Free Account</h4>
            <p className="text-xs text-purple-100 max-w-md mx-auto leading-relaxed">
              Click the button below to get FREE ACCESS to the GlycoSense App and secure your health for the people who count on you.
            </p>
          </div>

          <Link
            href="/get-glycosense"
            className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-blue-900 font-black text-sm sm:text-base rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border border-white"
          >
            <span>Claim Your Free GlycoSense Account</span>
            <span className="text-lg">➔</span>
          </Link>

          <p className="text-[11px] text-purple-200/90 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>100% Privacy Guaranteed. Safe, secure, and encrypted.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
