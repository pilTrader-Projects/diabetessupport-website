import { Metadata } from 'next';
import LeadMagnetCard from '@/components/LeadMagnetCard';
import { SITE_CONFIG } from '@/config/constants';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Free Download: 7-Day Diabetes Prevention & Action Cheatsheet | ${SITE_CONFIG.domain}`,
  description:
    'Download the free 7-Day Diabetes Action Plan & Cheatsheet PDF. Learn 5 daily morning habits to reset insulin sensitivity and track fasting glucose.',
};

/**
 * Dedicated Lead Magnet Download Landing Page (/guides/cheatsheet).
 *
 * @usecase Dedicated promotional landing page for lead magnet PDF download campaigns.
 * @dependencies LeadMagnetCard component, SITE_CONFIG.
 * @returns {JSX.Element} Rendered cheatsheet download landing page.
 */
export default function CheatsheetGuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="bg-amber-100 text-amber-900 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-300 inline-block">
          ⚡ Free Patient & Carer Resource
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          The 7-Day Diabetes Action Plan & Insulin Sensitivity Cheatsheet
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Stop guessing about blood sugar spikes. Get our step-by-step daily protocol to support healthy glucose levels naturally.
        </p>
      </div>

      {/* Main Lead Magnet Box */}
      <LeadMagnetCard
        title="Download Your Free 7-Day Diabetes Action Plan PDF"
        source="cheatsheet_landing_page"
      />

      {/* What's Inside Feature Grid */}
      <div className="space-y-6 pt-4">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          What You Will Find Inside The Free PDF:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Module 1
            </span>
            <h3 className="text-xl font-bold text-slate-900">Morning Insulin Sensitivity Reset</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              5 simple 2-minute morning habits proven to minimize dawn phenomenon glucose surges and prime your metabolism for the day.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Module 2
            </span>
            <h3 className="text-xl font-bold text-slate-900">Glycemic Index Meal Swaps</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A comprehensive list of high-glycemic staple foods paired with delicious, low-GI alternatives that don&apos;t compromise taste.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Module 3
            </span>
            <h3 className="text-xl font-bold text-slate-900">Post-Meal Movement Protocol</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              How a simple 10-minute post-meal walk utilizes soleus muscle glucose uptake to blunt blood sugar spikes by up to 30%.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md">
              Module 4
            </span>
            <h3 className="text-xl font-bold text-slate-900">Printable Glucose Tracker</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              A clean 7-day log sheet to track fasting glucose, pre/post-meal readings, and daily energy levels for your doctor visits.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="text-center pt-8 border-t border-slate-200">
        <Link href="/blog" className="text-sm font-bold text-teal-700 hover:text-teal-900">
          &larr; Browse All Diabetes Educational Articles
        </Link>
      </div>
    </div>
  );
}
