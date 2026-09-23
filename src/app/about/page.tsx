import { Metadata } from 'next';
import Link from 'next/link';
import { buildOrganizationSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'About Us & Mission | DiabetesCare PH',
  description:
    'Learn about DiabetesCare PH, our mission to protect Filipino families from the silent killer of diabetes, our founder story, and our educational standards.',
  alternates: {
    canonical: '/about',
  },
};

/**
 * About Us Page Component.
 *
 * @usecase Establishes organizational transparency, E-E-A-T credentials, health awareness mission,
 * an impactful gist of the founder's personal story, and links to the full narrative.
 * Styled with DiabetesCare PH signature brand theme (blue-800 to purple-900 to pink-600 gradient-kit-panel).
 * @returns {JSX.Element} Rendered about page.
 */
export default function AboutPage() {
  const orgSchema = buildOrganizationSchema();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 text-slate-800">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* Header */}
      <header className="space-y-4 text-center sm:text-left border-b border-slate-200 pb-8">
        <span className="bg-indigo-100 text-indigo-900 text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full border border-indigo-200 inline-block shadow-sm">
          Our Story &amp; Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Protecting Filipino Families from the Silent Threat of Diabetes
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
          Over 4 million Filipinos are currently living with diabetes, and nearly half remain undiagnosed until irreversible complications arise.
        </p>
      </header>

      {/* Why DiabetesCare PH Exists */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-900">Why DiabetesCare PH Exists</h2>
        <p>
          Diabetes is rarely an immediate health crisis—it is a <strong>silent financial and emotional catastrophe</strong>.
          When a family member or breadwinner develops preventable kidney failure, diabetic retinopathy, or cardiovascular
          complications, the economic and emotional burden destabilizes entire households for generations.
        </p>
        <p>
          <strong>DiabetesCare PH</strong> was established to bridge the awareness gap by offering free, evidence-based,
          and practical education tailored to the Philippine context—addressing staple Filipino dietary habits (like white rice,
          pancit, and merienda) and advocating early detection, accessible tracking, and metabolic literacy before an emergency occurs.
        </p>
      </section>

      {/* Impactful Gist of the Founder's Personal Story (Website Signature Brand Card) */}
      <section className="bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel text-white rounded-3xl p-7 sm:p-10 shadow-2xl border border-white/20 space-y-6">
        <div className="space-y-4">
          <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
            🎗️ A PERSONAL TURNING POINT
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
            The Personal Story Behind Our Advocacy
          </h2>

          {/* Founder Byline */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-11 h-11 rounded-full bg-white/15 border border-white/30 flex items-center justify-center text-white font-bold text-sm shadow-inner backdrop-blur-sm">
              BB
            </div>
            <div>
              <p className="text-white font-bold text-sm drop-shadow-sm">Bong Bungalan Jr.</p>
              <p className="text-amber-300 text-xs font-semibold">Founder &amp; Advocate</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl text-purple-100 text-sm sm:text-base leading-relaxed">
          <p>
            This mission was born from profound personal grief and lived experience. When our cousin&apos;s son, <strong className="text-white font-bold">Chris</strong>, passed away from severe diabetic complications and organ failure at just <strong className="text-amber-300 font-bold">36 years old</strong>, diabetes stopped being a distant statistic on a chart. Seeing a grieving mother lose her young son—and witnessing the crushing emotional and financial toll of advanced illness—forced a painful reckoning.
          </p>
          <p>
            At the time, my own wife had been living with diabetes amidst typical Filipino family habits—where white rice, pancit, and celebrations fill everyday life. When unexplained weight loss sounded an urgent alarm, it became clear: <strong className="text-white font-semibold">the diagnosis is not where the story begins</strong>. Metabolic damage and insulin resistance progress quietly for years before blood sugar spikes.
          </p>
          <p>
            In a culture where food is how we express love, you cannot simply say &ldquo;stop eating this.&rdquo; Families need compassionate understanding, scientific clarity, and actionable guidance meal by meal. We are raising a flag of awareness: <em className="text-amber-200 font-semibold">&ldquo;Don&apos;t wait for the disease to become loud before you listen to what your body has been telling you quietly for years.&rdquo;</em>
          </p>
        </div>

        {/* Link to the Full Article */}
        <div className="pt-2 border-t border-white/15 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            href="/about/story"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-purple-50 text-indigo-950 font-black text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01]"
          >
            <span>Read the Full Story: &ldquo;Why We Started This Mission&rdquo;</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <span className="text-xs text-purple-200 font-medium">
            5 min read &bull; Full founder narrative
          </span>
        </div>
      </section>

      {/* Core Mission Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="text-3xl">🛡️</div>
          <h3 className="font-bold text-slate-900 text-lg">Earlier Awareness</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Recognizing early metabolic warning signs and insulin resistance years before irreversible complications strike.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="text-3xl">🔬</div>
          <h3 className="font-bold text-slate-900 text-lg">Evidence-Based &amp; Local</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Content aligned with ADA and Philippine DOH guidelines, translated into culturally practical steps for Filipino homes.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2 hover:shadow-md transition-shadow">
          <div className="text-3xl">📱</div>
          <h3 className="font-bold text-slate-900 text-lg">GlycoSense Ecosystem</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Free digital tools empowering patients to log glucose and generate doctor-ready PDF reports without subscription fees.
          </p>
        </div>
      </section>

      {/* Editorial & Medical Independence Standards */}
      <section className="space-y-4 text-sm sm:text-base leading-relaxed bg-slate-100 p-6 rounded-2xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Editorial &amp; Independence Standards</h2>
        <p className="text-xs text-slate-700 leading-relaxed">
          We maintain strict editorial independence. We do not accept sponsorships from pharmaceutical companies to endorse
          specific prescription medications. Advertising revenue through Google AdSense helps maintain our server infrastructure
          and free educational content distribution.
        </p>
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>Medical Notice:</strong> Information on this website is for educational purposes only and is not intended as medical advice or personalized treatment plans. Always consult your licensed physician or endocrinologist before modifying medications or dietary routines.
        </p>
      </section>

      {/* Footer Navigation */}
      <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-indigo-700">
        <Link href="/" className="hover:underline">&larr; Back to Homepage</Link>
        <Link href="/contact" className="hover:underline">Contact the Team &rarr;</Link>
      </div>
    </div>
  );
}
