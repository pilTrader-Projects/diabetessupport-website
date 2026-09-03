'use client';

import React from 'react';
import KitOptInForm from './KitOptInForm';

export interface LeadMagnetCardProps {
  title?: string;
  subtitle?: string;
  source?: string;
}

/**
 * GlycoSense App Promotional Lead Capture Card Box with Kit Form Integration.
 *
 * @usecase Promotes the GlycoSense Preventive Glucose & Lifestyle Intelligence App (multi-metric tracking & AI health companion).
 * @param {LeadMagnetCardProps} props Custom parameters.
 * @dependencies KitOptInForm component.
 * @returns {JSX.Element} Rendered app promotional card container.
 */
export default function LeadMagnetCard({
  title = 'GlycoSense — Free Preventive Glucose & Lifestyle Intelligence App',
  subtitle = 'Take proactive control over your metabolic health today. Effortlessly track your glucose readings, blood pressure, meals, weight, and medications for free, while our AI Health Companion analyzes your habits to deliver personalized preventive insights.',
  source = 'glycosense_free_app_promo',
}: LeadMagnetCardProps) {
  return (
    <div className="my-10 bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-teal-800 grid grid-cols-1 lg:grid-cols-12">
      {/* Left Feature Bullet Area */}
      <div className="lg:col-span-5 p-8 sm:p-10 bg-gradient-to-br from-teal-950 to-slate-950 flex flex-col justify-between space-y-6 border-b lg:border-b-0 lg:border-r border-teal-900/60">
        <div className="space-y-4">
          <span className="inline-block bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30">
            ⚡️ 100% Free Health App
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
              <span><strong>Free Multi-Metric Tracking:</strong> Easily log glucose, blood pressure, meals, weight, and medications in one seamless app.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-amber-400 font-bold text-base mt-0.5">✓</span>
              <span><strong>AI Health Companion & Agent:</strong> Intelligent pattern recognition automatically analyzes daily habits to reveal hidden blood sugar triggers.</span>
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

      {/* Right Form Area */}
      <div className="lg:col-span-7 p-6 sm:p-8 flex items-center">
        <div className="w-full">
          <KitOptInForm
            title="Get Free Instant Access to GlycoSense"
            subtitle="Enter your email below to receive your free app access link and start tracking your blood sugar, meals & vital health metrics today."
            buttonText="Get Free Access to GlycoSense App ➔"
            layout="card"
            source={source}
          />
        </div>
      </div>
    </div>
  );
}
