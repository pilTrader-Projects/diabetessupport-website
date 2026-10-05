import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy & Data Security Notice | Before the Numbers',
  description:
    'Comprehensive data privacy notice detailing compliance with RA 10173 (Philippine Data Privacy Act), local device storage architecture, and health data protections.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

/**
 * Legal Data Privacy Policy Page Component.
 *
 * @usecase Outlines client-side local storage architecture, ephemeral cross-device sync,
 * Google AdSense cookie usage, and RA 10173 / NPC compliance.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-slate-800">
      <header className="space-y-3 text-center sm:text-left border-b border-slate-200 pb-6">
        <span className="bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-200 inline-block">
          Legal &amp; Regulatory Compliance
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Privacy Policy &amp; Data Protection
        </h1>
        <p className="text-sm font-semibold text-slate-500">
          Last Updated: October 2026 • Governed by Global Standards &amp; Republic Act No. 10173 (National Privacy Commission)
        </p>
      </header>

      {/* 1. Commitment to Health Data Confidentiality */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">1. Commitment to Health Data Confidentiality</h2>
        <p>
          At <strong>Before the Numbers</strong> ({`https://${SITE_CONFIG.domain}`}), we recognize that personal health observations,
          blood glucose trends, and lifestyle histories represent <em>Sensitive Personal Information</em>. In the Philippines,
          we adhere strictly to the <strong>Philippine Data Privacy Act of 2012 (Republic Act No. 10173)</strong> and the regulations
          promulgated by the <strong>National Privacy Commission</strong> (NPC), alongside international data privacy best practices.
        </p>
        <p>
          We guarantee that your personal health data belongs entirely to you. We do not sell, rent, monetize, or disclose your
          health records to third-party insurance providers, pharmaceutical companies, or data brokers.
        </p>
      </section>

      {/* 2. Local Device Storage Architecture */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">2. Local Device Storage Architecture (localStorage)</h2>
        <p>
          Unlike legacy medical portals that store personal health logs in centralized, vulnerable cloud databases, Before the Numbers
          prioritizes privacy-by-design through <strong>Local Device Storage Architecture</strong>.
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 text-sm">
          <li>
            <strong>My Library &amp; Bookmarks:</strong> When you save lectures, protocols, or studies to &ldquo;My Library&rdquo;, your
            anonymous bookmarks and saved reading lists are retained strictly on your device using client-side <code>localStorage</code>.
          </li>
          <li>
            <strong>Community Pseudonyms:</strong> In our peer community, your display alias and 4-digit numeric tag are stored
            locally on your browser to allow pseudonymous participation without requiring persistent password-based user accounts.
          </li>
        </ul>
      </section>

      {/* 3. Anonymous Cross-Device Pairing */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">3. Anonymous Cross-Device Pairing</h2>
        <p>
          To synchronize your reading bookmarks or community identity between your smartphone and computer, we utilize
          privacy-preserving <strong>Anonymous Cross-Device Pairing</strong>:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 text-sm">
          <li>
            Pairing is initiated via an <strong>ephemeral 6-digit sync PIN</strong> or a temporary QR code deep-link with a strict <strong>10-minute validity</strong> window.
          </li>
          <li>
            The ephemeral sync code only transfers your public pseudonym or bookmark identifiers directly to the second device, after which the temporary pairing record is permanently deleted.
          </li>
          <li>
            <strong>Zero health records are stored on a central server</strong> during or after this synchronization process.
          </li>
        </ul>
      </section>

      {/* 4. Google AdSense & Third-Party Advertising Cookies */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">4. Google AdSense &amp; Advertising Cookies</h2>
        <p>
          We use <strong>Google AdSense</strong> to display programmatic advertisements across educational guides to support
          our free public health resources and server infrastructure. Google, as a third-party vendor, uses cookies to serve ads
          based on previous visits:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-slate-700 text-sm">
          <li>
            <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads
            to users based on their visits to our website and other sites across the web.
          </li>
          <li>
            <strong>Opt-Out Options:</strong> You may opt out of personalized advertising at any time by visiting{' '}
            <a
              href="https://myadcenter.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 font-bold underline hover:text-teal-900"
            >
              Google Ads Settings
            </a>{' '}
            or{' '}
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

      {/* 5. Email Subscription & Lead Delivery (Brevo) */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">5. Email Subscriptions &amp; Communication (Brevo)</h2>
        <p>
          When you optionally subscribe to our weekly newsletter or download educational guides, your email address
          is processed securely through our transactional delivery partner (Brevo). This data is utilized solely for
          delivering metabolic educational content and newsletter updates. You may opt out at any time via the single-click
          &ldquo;Unsubscribe&rdquo; link included in every email.
        </p>
      </section>

      {/* 6. Data Rights, Export & Local Deletion */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-slate-100 p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">6. Data Rights, Export &amp; Local Deletion</h2>
        <p>
          Under RA 10173 and international privacy frameworks, you have full sovereignty over your data, including the right
          to access, rectify, object, and erase your information:
        </p>
        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <h3 className="font-bold text-slate-900">Clearing Local Browser Data:</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Because your library bookmarks and device credentials are kept in client-side storage, you can immediately erase all
              local records by opening your browser settings &rarr; Privacy &amp; Security &rarr; Clear Browsing Data &rarr; select
              &ldquo;Cookies and site data&rdquo; for {SITE_CONFIG.domain}.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Deleting Newsletter Records:</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To request permanent erasure of your email address from our subscriber mailing lists, email our Data Protection Officer
              at <a href="mailto:dpo@beforethenumbers.org" className="text-teal-700 font-bold underline">dpo@beforethenumbers.org</a> or
              use the unsubscribe link at the bottom of any message.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Contact Our Data Protection Officer */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-xl font-bold text-slate-900">7. Contact Our Data Protection Officer</h2>
        <p>
          For regulatory inquiries, compliance verification, or questions regarding our data practices under Republic Act No. 10173,
          please contact our Data Protection Officer at:
        </p>
        <p className="text-sm font-semibold text-slate-700">
          Email: <a href="mailto:dpo@beforethenumbers.org" className="text-teal-700 font-bold underline">dpo@beforethenumbers.org</a> • <Link href="/contact" className="text-teal-700 font-bold underline">Contact Page</Link>
        </p>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-teal-700">
        <Link href="/" className="hover:underline">&larr; Back to Home</Link>
        <Link href="/terms-of-service" className="hover:underline">Terms of Service &rarr;</Link>
      </div>
    </div>
  );
}
