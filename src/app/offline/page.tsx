import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Offline Mode | DiabetesCare PH',
  description: 'You are currently offline. Review emergency diabetes safety tips and reconnect when signal returns.',
};

/**
 * Offline Fallback Page for DiabetesCare PH PWA.
 *
 * @usecase Displayed by the Service Worker when a user is offline and navigates to an uncached page.
 * Provides vital offline diabetes guidance (e.g. 15-15 hypoglycemia rule).
 * @returns {JSX.Element} Rendered offline safety interface.
 */
export default function OfflinePage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 sm:p-10 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-4xl shadow-inner">
          📡
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-indigo-700 bg-indigo-100/70 px-3 py-1 rounded-full">
            No Internet Connection
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            You are currently offline
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Don't worry — previously viewed educational articles and cached tools remain accessible. Once your connection returns, the app will automatically synchronize.
          </p>
        </div>

        {/* Emergency Diabetes Safety Tip (Offline Available) */}
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/80 rounded-2xl p-5 text-left space-y-2 text-slate-800 shadow-sm">
          <div className="flex items-center space-x-2 font-bold text-rose-800 text-sm">
            <span>🚨</span>
            <span>Emergency Guide: The 15-15 Hypoglycemia Rule</span>
          </div>
          <p className="text-xs text-rose-900/90 leading-relaxed">
            If you feel dizzy, shaky, sweating, or weak (signs of low blood sugar below 70 mg/dL):
          </p>
          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside font-medium">
            <li>Consume <strong>15 grams of fast-acting carbohydrate</strong> (half a glass of fruit juice, 3-4 candies, or 1 tablespoon of sugar/honey).</li>
            <li>Wait <strong>15 minutes</strong> and re-test finger-prick blood glucose.</li>
            <li>If still below 70 mg/dL, repeat the 15g carbs and consult a doctor immediately.</li>
          </ul>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 text-white font-bold text-sm shadow-md hover:opacity-95 transition-opacity"
          >
            Try Refreshing Home
          </Link>
          <Link
            href="/glycosense"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
          >
            Go to GlycoSense
          </Link>
        </div>
      </div>
    </div>
  );
}
