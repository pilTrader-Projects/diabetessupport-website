import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: 'About Us & Mission | DiabetesCare PH',
  description:
    'Learn about DiabetesCare PH, our mission to protect Filipino breadwinners and families from the silent killer of diabetes, and our educational standards.',
  alternates: {
    canonical: '/about',
  },
};

/**
 * About Us Page Component.
 *
 * @usecase Establishes organizational transparency, E-E-A-T credentials, health awareness mission, and editorial independence.
 * @dependencies SITE_CONFIG constant, Next.js Link.
 * @returns {JSX.Element} Rendered about page.
 */
export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      <header className="space-y-4 text-center sm:text-left border-b border-slate-200 pb-8">
        <span className="bg-teal-100 text-teal-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-teal-200 inline-block">
          Our Story & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Protecting Filipino Families from the Silent Threat of Diabetes
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          Over 4 million Filipinos are currently living with diabetes, and nearly half remain undiagnosed until irreversible complications arise.
        </p>
      </header>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900">Why DiabetesCare PH Exists</h2>
        <p>
          Diabetes is rarely an immediate health crisis—it is a <strong>silent financial and emotional catastrophe</strong>.
          When a family breadwinner develops preventable kidney failure, diabetic retinopathy, or cardiovascular
          complications, the economic burden destabilizes generations.
        </p>
        <p>
          <strong>DiabetesCare PH</strong> was established to bridge the awareness gap by offering free, evidence-based,
          and practical education tailored to the Philippine context—addressing staple Filipino dietary habits (like white rice
          and ulam staples) and advocating accessible, manual finger-prick monitoring over expensive equipment.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-3xl">🛡️</div>
          <h3 className="font-bold text-slate-900 text-lg">Wealth Protection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Framing daily glucose checks as the single highest-ROI financial habit a provider can maintain.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-3xl">🔬</div>
          <h3 className="font-bold text-slate-900 text-lg">Evidence-Based</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Content aligned with American Diabetes Association (ADA) and Philippine DOH clinical guidelines.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="text-3xl">📱</div>
          <h3 className="font-bold text-slate-900 text-lg">GlycoSense Ecosystem</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Free digital tools empowering patients to generate doctor-ready PDF reports without subscription lock-ins.
          </p>
        </div>
      </section>

      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-slate-100 p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Editorial & Independence Standards</h2>
        <p className="text-xs text-slate-700 leading-relaxed">
          We maintain strict editorial independence. We do not accept sponsorships from pharmaceutical companies to endorse
          specific prescription medications. Advertising revenue through Google AdSense helps maintain our server infrastructure
          and free educational content distribution.
        </p>
      </section>

      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-teal-700">
        <Link href="/" className="hover:underline">&larr; Back to Homepage</Link>
        <Link href="/contact" className="hover:underline">Contact the Team &rarr;</Link>
      </div>
    </div>
  );
}
