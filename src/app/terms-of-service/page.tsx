import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: 'Terms of Service & Medical Safe Harbor | DiabetesCare PH',
  description:
    'Terms of service, medical disclaimer, and Software as a Medical Device (SaMD) regulatory safe harbor policies for DiabetesCare PH and GlycoSense.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

/**
 * Terms of Service Page Component.
 *
 * @usecase Defines acceptable use, non-diagnostic educational scope, SaMD safe harbor, and limitation of liability.
 * @dependencies SITE_CONFIG constant, Next.js Link.
 * @returns {JSX.Element} Rendered terms of service document.
 */
export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-slate-800">
      <header className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-6">
        <span className="bg-purple-100 text-purple-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-purple-200 inline-block">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Terms of Service & Clinical Disclaimer
        </h1>
        <p className="text-sm font-semibold text-slate-500">
          Last Updated: September 2026 • Platform: {SITE_CONFIG.domain}
        </p>
      </header>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-amber-50 p-6 rounded-2xl border border-amber-200">
        <h2 className="text-xl font-black text-amber-950">
          ⚠️ Mandatory Medical & Non-Diagnostic Disclaimer
        </h2>
        <p className="text-amber-900">
          <strong>DiabetesCare PH</strong> and its companion digital tools (including GlycoSense) provide general
          health awareness, educational resources, and personal record-keeping utilities.
          <strong> Content published on this platform is NOT medical advice, clinical diagnosis, or a treatment plan.</strong>
        </p>
        <p className="text-amber-900 text-xs leading-relaxed">
          Never disregard professional medical advice or delay seeking evaluation from a licensed physician,
          endocrinologist, or registered dietitian due to information read on this website. In case of a medical
          emergency (e.g. severe hypoglycemia or ketoacidosis), contact local emergency healthcare providers immediately.
        </p>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">1. Software as a Medical Device (SaMD) Safe Harbor</h2>
        <p>
          The GlycoSense PWA and associated export utilities operate strictly as <em>digital logbooks and patient-organized
          summaries</em>. They do not calculate insulin dosages, perform automated diagnostic algorithms, or replace
          certified medical devices. Users are responsible for inputting accurate readings.
        </p>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">2. Intellectual Property & Fair Use</h2>
        <p>
          All educational articles, infographics, calculators, and brand elements on {SITE_CONFIG.domain} are owned by{' '}
          {SITE_CONFIG.author}. You may download printable cheat sheets for personal, non-commercial use.
          Reproduction or redistribution for commercial exploitation without prior written consent is prohibited.
        </p>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">3. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, DiabetesCare PH and its contributors shall not be liable for any direct,
          indirect, incidental, or consequential damages resulting from the use or inability to use the site&apos;s materials.
        </p>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-teal-700">
        <Link href="/privacy-policy" className="hover:underline">&larr; Privacy Policy</Link>
        <Link href="/about" className="hover:underline">About Us &rarr;</Link>
      </div>
    </div>
  );
}
