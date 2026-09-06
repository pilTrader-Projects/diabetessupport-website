import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Security Notice | DiabetesCare PH',
  description:
    'Comprehensive data privacy notice detailing compliance with RA 10173 (Philippine Data Privacy Act), Google AdSense cookie policies, and sensitive health metric encryption.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

/**
 * Legal Data Privacy Policy Page Component.
 *
 * @usecase Outlines data handling protocols, Google AdSense third-party cookie usage, and RA 10173 health data protections.
 * @dependencies SITE_CONFIG constant, Next.js Link.
 * @returns {JSX.Element} Rendered privacy policy page.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-slate-800">
      <header className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-6">
        <span className="bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-200 inline-block">
          Legal & Regulatory Compliance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy & Data Protection
        </h1>
        <p className="text-sm font-semibold text-slate-500">
          Last Updated: September 2026 • Governed by Republic Act No. 10173 & Global Standards
        </p>
      </header>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">1. Commitment to Health Data Confidentiality</h2>
        <p>
          At <strong>DiabetesCare PH</strong> ({SITE_CONFIG.domain}), we understand that personal glucose levels,
          blood pressure logs, and medical histories represent <em>Sensitive Personal Information</em>. In strict
          adherence to the <strong>Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong>, GDPR, and
          international healthcare privacy frameworks, we guarantee that your personal logs are encrypted, strictly
          owned by you, and never sold, rented, or leased to third-party insurers, advertisers, or brokers.
        </p>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">2. Google AdSense & Third-Party Advertising Cookies</h2>
        <p>
          We use <strong>Google AdSense</strong> to display advertisements across educational articles to fund our free
          health awareness resources. Google, as a third-party vendor, uses cookies to serve ads on our site based on
          a user&apos;s prior visits to our website or other websites on the internet.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700">
          <li>
            <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of advertising cookies enables it and its
            partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.
          </li>
          <li>
            <strong>Opt-Out Policy:</strong> Users may opt out of personalized advertising by visiting{' '}
            <a
              href="https://myadcenter.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 font-bold underline hover:text-teal-900"
            >
              Google Ads Settings
            </a>{' '}
            or through{' '}
            <a
              href="https://optout.aboutads.info/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 font-bold underline hover:text-teal-900"
            >
              AboutAds.info
            </a>.
          </li>
        </ul>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">3. Email Subscription & Lead Capture (Kit)</h2>
        <p>
          When you subscribe to our weekly newsletter or download our free educational PDFs, your email address is
          processed through our email service partner (Kit / ConvertKit). We utilize this information exclusively to
          deliver health guides, low-GI meal swaps, and platform updates. You may unsubscribe at any time via the
          single-click &quot;Unsubscribe&quot; link in every email.
        </p>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">4. Contact Our Data Protection Officer</h2>
        <p>
          For questions regarding this policy or to request deletion of your stored subscriber information, please visit
          our <Link href="/contact" className="text-teal-700 font-bold underline">Contact Page</Link>.
        </p>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-teal-700">
        <Link href="/" className="hover:underline">&larr; Back to Home</Link>
        <Link href="/terms-of-service" className="hover:underline">Terms of Service &rarr;</Link>
      </div>
    </div>
  );
}
