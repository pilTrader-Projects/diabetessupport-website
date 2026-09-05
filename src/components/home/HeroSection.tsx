import React from 'react';
import Link from 'next/link';

/**
 * Hero Section Component for Home Page with Breadwinner Positioning.
 *
 * @usecase Captures attention of family breadwinners with a single prominent primary CTA and subtle secondary article navigation.
 * @param None Component takes no props.
 * @dependencies Next.js Link component, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered Hero Section.
 */
export default function HeroSection(): React.JSX.Element {
  return (
    <section className="min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-8 sm:py-12">
      <span className="inline-block bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200">
        🛡️ For Family Providers &amp; Breadwinners
      </span>

      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
        Your Family Depends on Your Income. Don’t Let a <span className="text-rose-600 underline decoration-rose-300">Silent Killer</span> Take You Out of the Game.
      </h1>

      <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Diabetes thrives in comfortable silence. By the time you &ldquo;feel&rdquo; sick, irreversible damage to your heart, kidneys, and nerves has already begun. If you are the bedrock of your home, your health is your family&apos;s greatest financial asset.
      </p>

      <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium">
        GlycoSense is the zero-cost tracking dashboard built for busy providers. Turn simple, budget-friendly finger-prick tests and blood pressure checks into clear, actionable daily trends that help you and your doctor safeguard your health.
      </p>

      {/* Optimized Single Primary Action Area */}
      <div className="pt-2 flex flex-col items-center justify-center space-y-4 w-full max-w-md mx-auto">
        <Link
          href="#campaign"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl shadow-2xl hover:shadow-slate-900/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-slate-700"
        >
          <span>Claim Your Free GlycoSense Account</span>
          <span className="text-xl">➔</span>
        </Link>
        <Link
          href="#education"
          className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-teal-700 transition-colors inline-flex items-center gap-1 group"
        >
          <span>or browse our educational article library</span>
          <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
        </Link>
      </div>

      <a
        href="#progression"
        aria-label="Scroll down to target numbers section"
        className="pt-4 inline-flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group"
      >
        <span className="text-xs font-semibold tracking-wider uppercase group-hover:translate-y-0.5 transition-transform">
          Target Metrics Below
        </span>
        <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </a>
    </section>
  );
}
