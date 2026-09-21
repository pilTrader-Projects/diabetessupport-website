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
 * @usecase Bridges the freshly opted-in lead from the 3-page cheat sheet to immediate adoption of the GlycoSense digital tracking dashboard.
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered bridge upsell page.
 */
export default function ResetSuccessPage(): React.JSX.Element {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 py-16 px-4 sm:px-6 lg:px-8 text-white flex items-center justify-center">
      {/* Background ambient lighting */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-pink-600/15 blur-[120px] pointer-events-none"
        aria-hidden="true"
      />

      <main className="relative max-w-3xl w-full bg-slate-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-12 shadow-2xl space-y-10">
        {/* Header Alert */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-500/20 text-teal-300 rounded-full border border-teal-400/40 text-4xl shadow-inner animate-bounce">
            🎉
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Your Free Report is on the Way to Your Inbox!
          </h1>
          <p className="text-sm sm:text-base text-purple-200/90 font-medium max-w-xl mx-auto">
            Check your inbox in 2 to 5 minutes for your 3-page PDF. If you do not see it, please check your spam or promotions tab.
          </p>
        </div>

        {/* Bridge Upsell Section */}
        <section className="bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border border-purple-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="space-y-3">
            <span className="inline-block bg-amber-400/20 text-amber-300 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-amber-400/30">
              ⚡ Critical Next Step
            </span>
            <p className="text-base sm:text-lg text-slate-100 leading-relaxed font-medium">
              While you wait, read this critical next step: In the report, you will learn that you cannot manage what you do not measure. Dropping your insulin requires you to know exactly which local foods are causing your system to panic. To help you track this without spending thousands of pesos on expensive medical tech, we built <strong className="text-white underline decoration-pink-500 decoration-2">GlycoSense</strong>—the zero-cost digital health dashboard for family providers.
            </p>
          </div>

          {/* Value Proposition Bullets */}
          <div className="space-y-4 pt-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-purple-300">
              How GlycoSense Protects Your Metabolism:
            </h2>
            <ul className="space-y-3.5 text-sm sm:text-base text-slate-200">
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg flex-shrink-0 mt-0.5">🟢</span>
                <span>
                  <strong className="text-white">Turn your manual finger-prick logs into automated trend charts.</strong> No expensive continuous glucose monitors required.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg flex-shrink-0 mt-0.5">🟢</span>
                <span>
                  <strong className="text-white">Identify your specific local food triggers instantly.</strong> Pinpoint whether white rice, milk tea, or local bakery treats cause your post-meal spikes.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-emerald-400 text-lg flex-shrink-0 mt-0.5">🟢</span>
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
              className="w-full inline-flex items-center justify-center gap-3 py-4 sm:py-5 px-8 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 hover:from-pink-400 hover:to-amber-300 text-white font-black text-base sm:text-lg rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/30"
            >
              <span>Claim Your Free GlycoSense Account</span>
              <span className="text-xl">➔</span>
            </Link>
            <p className="text-xs text-purple-300/80">
              🔒 100% Free • Works in Any Mobile Browser • Zero App Store Download Required
            </p>
          </div>
        </section>

        {/* Fallback Direct Download Link */}
        <div className="pt-4 border-t border-white/10 text-center space-y-3">
          <p className="text-xs text-slate-400">
            Need immediate offline access? You can also download the cheat sheet directly:
          </p>
          <a
            href="https://diabetescareph.com/downloads/hidden-clock-cheat-sheet.pdf"
            download
            className="inline-flex items-center gap-2 text-xs font-bold text-teal-300 hover:text-teal-200 underline decoration-teal-500/50"
          >
            <span>📥 Download 3-Page Hidden Clock Protocol PDF directly</span>
          </a>
        </div>
      </main>
    </div>
  );
}
