import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '🎉 Your Free Report is on the Way! | Next Critical Step',
  description:
    'Your free 3-page Insulin Reset Protocol Cheat Sheet is on its way to your inbox. Read this critical next step to start tracking your local food triggers with GlycoSense.',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * High-Converting Bridge Page / Upsell Route (/reset-success).
 *
 * @usecase Bridges the freshly opted-in lead from the 3-page cheat sheet to immediate adoption of the GlycoSense digital tracking dashboard, styled in full harmony with the site's global theme.
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered bridge upsell page.
 */
export default function ResetSuccessPage(): React.JSX.Element {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <main className="space-y-10">
        {/* Header Alert */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 text-teal-700 rounded-full border border-teal-200 text-3xl shadow-sm">
            🎉
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            Your Free Report is on the Way to Your Inbox!
          </h1>
          <p className="text-base text-slate-600 font-medium max-w-xl mx-auto leading-relaxed">
            Check your inbox in 2 to 5 minutes for your 3-page PDF. If you do not see it, please check your spam or promotions tab.
          </p>
        </div>

        {/* Bridge Upsell Section - Signature Brand Panel Theme */}
        <section className="bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20 gradient-kit-panel space-y-6">
          <div className="space-y-3">
            <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
              ⚡ Critical Next Step
            </span>
            <p className="text-base sm:text-lg text-purple-100 leading-relaxed font-medium">
              While you wait, read this critical next step: In the report, you will learn that you cannot manage what you do not measure. Dropping your insulin requires you to know exactly which local foods are causing your system to panic. To help you track this without spending thousands of pesos on expensive medical tech, we built <strong className="text-white underline decoration-amber-400 decoration-2">GlycoSense</strong>—the zero-cost digital health dashboard for family providers.
            </p>
          </div>

          {/* Value Proposition Bullets */}
          <div className="space-y-4 pt-2 border-t border-white/15">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-200">
              How GlycoSense Protects Your Metabolism:
            </h2>
            <ul className="space-y-3 text-sm sm:text-base text-purple-50">
              <li className="flex items-start gap-3">
                <span className="text-emerald-300 text-lg flex-shrink-0 mt-0.5">🟢</span>
                <span>
                  <strong className="text-white">Turn your manual finger-prick logs into automated trend charts.</strong> No expensive continuous glucose monitors required.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-300 text-lg flex-shrink-0 mt-0.5">🟢</span>
                <span>
                  <strong className="text-white">Identify your specific local food triggers instantly.</strong> Pinpoint whether white rice, milk tea, or local bakery treats cause your post-meal spikes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-300 text-lg flex-shrink-0 mt-0.5">🟢</span>
                <span>
                  <strong className="text-white">Export doctor-ready reports for your next checkup.</strong> Give your physician clear statistical evidence of your lifestyle progress.
                </span>
              </li>
            </ul>
          </div>

          {/* Primary CTA Button */}
          <div className="pt-4 space-y-3 text-center">
            <Link
              href="/#campaign"
              className="w-full inline-flex items-center justify-center gap-3 py-4 sm:py-5 px-8 bg-white hover:bg-slate-100 text-blue-900 font-black text-base sm:text-lg rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border border-white cursor-pointer"
            >
              <span>Claim Your Free GlycoSense Account</span>
              <span className="text-xl">➔</span>
            </Link>
            <p className="text-xs text-purple-200/90 flex items-center justify-center gap-1.5">
              <span>🔒</span>
              <span>100% Free • Works in Any Mobile Browser • 100% Privacy Guaranteed under RA 10173</span>
            </p>
          </div>
        </section>

        {/* Fallback Direct Download Box */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
          <p className="text-sm text-slate-600">
            Need immediate offline access? You can also download the cheat sheet directly:
          </p>
          <div>
            <a
              href="https://diabetescareph.com/downloads/hidden-clock-cheat-sheet.pdf"
              download
              className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 underline decoration-teal-400"
            >
              <span>📥 Download 3-Page Hidden Clock Protocol PDF directly</span>
            </a>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center pt-2">
          <Link href="/" className="text-sm font-bold text-teal-700 hover:text-teal-900">
            &larr; Return to Homepage
          </Link>
        </div>
      </main>
    </div>
  );
}
