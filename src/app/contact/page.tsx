import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: 'Contact Us & Editorial Inquiries | DiabetesCare PH',
  description:
    'Get in touch with the DiabetesCare PH team for general inquiries, feedback, medical corrections, or community partnership.',
  alternates: {
    canonical: '/contact',
  },
};

/**
 * Contact & Editorial Feedback Page Component.
 *
 * @usecase Provides direct contact avenues, feedback handling, and medical correction submission channels.
 * @dependencies SITE_CONFIG constant, Next.js Link.
 * @returns {JSX.Element} Rendered contact page.
 */
export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      <header className="space-y-4 text-center sm:text-left border-b border-slate-200 pb-8">
        <span className="bg-pink-100 text-pink-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-pink-200 inline-block">
          Get In Touch
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Contact DiabetesCare PH
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          Have questions, feedback on an article, or want to suggest a topic? We&apos;re here to help.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">General Inquiries & Feedback</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            For feedback regarding our educational articles, lead magnet PDFs, or general platform inquiries:
          </p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-sm font-semibold text-slate-700">
            <p>📧 Email: <span className="text-indigo-700 font-bold">support@{SITE_CONFIG.domain}</span></p>
            <p>🌐 Website: <span className="text-slate-900">{SITE_CONFIG.domain}</span></p>
            <p>🇵🇭 Region: <span className="text-slate-900">Metro Manila, Philippines</span></p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Medical Corrections & Editorial Policy</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            We strive for strict accuracy in all clinical data citations. If you are a healthcare professional and
            spot a discrepancy or updated clinical guideline, please contact us with subject line{' '}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-700">
              [Medical Review Correction]
            </code>.
          </p>
          <p className="text-xs text-slate-500">
            Our editorial advisory board reviews and publishes corrections within 48 business hours.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-950 p-8 rounded-3xl text-white space-y-4 shadow-xl text-center sm:text-left">
        <h3 className="text-2xl font-black text-white">Join Our Weekly Educational Community</h3>
        <p className="text-sm text-purple-200 max-w-2xl leading-relaxed">
          Receive our newest low-GI recipes, blood sugar management strategies, and exclusive downloadable cheat sheets
          directly to your inbox every Sunday morning.
        </p>
        <div className="pt-2">
          <Link
            href="/subscribe"
            className="inline-block bg-white text-indigo-950 hover:bg-purple-50 font-black text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            Subscribe to Free Weekly Briefing &rarr;
          </Link>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 text-center">
        <Link href="/" className="text-sm font-bold text-teal-700 hover:text-teal-900">
          &larr; Back to DiabetesCare PH Homepage
        </Link>
      </div>
    </div>
  );
}
