import { Metadata } from 'next';
import KitOptInForm from '@/components/KitOptInForm';
import { SITE_CONFIG } from '@/config/constants';
import Link from 'next/link';

export const metadata: Metadata = {
  title: `Subscribe to Diabetes Care Newsletter | ${SITE_CONFIG.domain}`,
  description:
    'Join thousands of individuals receiving weekly evidence-based diabetes prevention, insulin resistance guides, and low-GI meal planning advice.',
};

/**
 * Dedicated Newsletter Subscription Landing Page.
 *
 * @usecase Dedicated landing page for email newsletter signups via direct links or campaigns.
 * @dependencies KitOptInForm component, SITE_CONFIG.
 * @returns {JSX.Element} Rendered newsletter subscription landing page.
 */
export default function SubscribePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200 inline-block">
          📩 Weekly Health & Wellness Briefing
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Stay Informed. Stay Proactive. Take Control.
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Get practical, science-backed advice delivered straight to your inbox every week. Free forever.
        </p>
      </div>

      {/* Main Opt-In Form Card */}
      <KitOptInForm
        title="Join the DiabetesCare PH Newsletter"
        subtitle="Receive our latest educational guides, blood sugar management strategies, and exclusive downloadable resources."
        buttonText="Subscribe Now (Free)"
        layout="card"
        source="subscribe_page"
      />

      {/* Benefit Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-2xl">🧠</div>
          <h3 className="font-bold text-slate-900 text-lg">Evidence-Based Info</h3>
          <p className="text-sm text-slate-600">
            Articles written and reviewed against modern clinical diabetes guidelines.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-2xl">🥗</div>
          <h3 className="font-bold text-slate-900 text-lg">Low-GI Nutrition Tips</h3>
          <p className="text-sm text-slate-600">
            Actionable meal swaps to keep post-meal glucose steady without sacrificing flavor.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-2xl">🛑</div>
          <h3 className="font-bold text-slate-900 text-lg">Zero Spam Promise</h3>
          <p className="text-sm text-slate-600">
            Your email is never shared. Unsubscribe anytime with a single click.
          </p>
        </div>
      </div>

      {/* Back Link */}
      <div className="text-center pt-6">
        <Link href="/" className="text-sm font-bold text-teal-700 hover:text-teal-900">
          &larr; Back to Homepage
        </Link>
      </div>
    </div>
  );
}
