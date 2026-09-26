import { Metadata } from 'next';
import Link from 'next/link';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { IPost } from '@/types/blog';
import { SITE_CONFIG } from '@/config/constants';
import { buildHomeMedicalOrgSchema, buildCommunityHomeFaqSchema } from '@/lib/schema';

export const revalidate = 60; // Refresh static page every 60 seconds

export const metadata: Metadata = {
  title: 'DiabetesCare PH | Free Metabolic Health & Blood Sugar Tools for Filipino Families',
  description:
    'A mission-driven community hub providing free metabolic health resources, ancestral nutrition blueprints, and the GlycoSense blood sugar tracking application tailored for Filipino breadwinners.',
  keywords: [
    'diabetes support philippines',
    'reverse insulin resistance pinoy',
    'tracking blood sugar free app',
    'filipino low carb guide',
    'chronic disease prevention',
    'RA 10173 medical privacy',
  ],
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}`,
  },
  openGraph: {
    title: 'DiabetesCare PH | Free Metabolic Health & Blood Sugar Tools for Filipino Families',
    description:
      'Empowering Filipino breadwinners with free ancestral nutrition guides, community support, and zero-cost blood sugar tracking.',
    url: `https://${SITE_CONFIG.domain}`,
    siteName: SITE_CONFIG.title,
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DiabetesCare PH | Free Metabolic Health & Blood Sugar Tools for Filipino Families',
    description:
      'Join our mission-driven grassroots community protecting Filipino family wealth through preventative metabolic health.',
  },
};

/**
 * Organic Community Root Page & Mission-Driven Educational Hub (/).
 *
 * @usecase Serves as the authoritative, educational, non-commercial front door for DiabetesCare PH, passively guiding organic traffic to /insulin-reset and /glycosense.
 * @returns {Promise<JSX.Element>} Rendered organic community homepage.
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  const orgSchema = buildHomeMedicalOrgSchema();
  const faqSchema = buildCommunityHomeFaqSchema();

  let rawPosts: any[] = [];
  try {
    await dbConnect();
    rawPosts = await PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean();
  } catch (err) {
    console.error('Error retrieving posts for community root page:', err);
  }

  const articles: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    category: doc.category?.toString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-20">
      {/* Schema.org Organization & FAQPage JSON-LD Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* ========================================================================= */}
      {/* PILLAR A: THE MISSION-DRIVEN HERO SECTION                                 */}
      {/* ========================================================================= */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-teal-300 shadow-xs">
          <span>🇵🇭</span>
          <span>Grassroots Filipino Health Movement</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
          Protecting Filipino Family Wealth Through{' '}
          <span className="text-teal-700 underline decoration-teal-300">
            Preventative Metabolic Health.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          We are a grass-roots community of providers, breadwinners, and advocates dedicated to exposing the hidden lifestyle roots of chronic illness. We offer zero-cost tools, ancestral nutrition guides, and peer blueprints to help your household live a vibrant, medicine-free life.
        </p>

        {/* Symmetrical Secondary-Styled CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <a
            href="#resources"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-base rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <span>Explore Free Resources</span>
            <span className="text-lg">↓</span>
          </a>
          <Link
            href="/community"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-base rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
          >
            <span>Join the Community</span>
            <span className="text-lg">👥</span>
          </Link>
        </div>

        <p className="text-xs text-slate-500 pt-1">
          Open-access community initiative • 100% Free Forever • Zero commercial barrier
        </p>
      </section>

      {/* ========================================================================= */}
      {/* PILLAR C: TRANSPARENT PHILIPPINE METABOLIC STATISTICS                     */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            📊 The Philippine Reality
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Metabolic Health is a Wealth Preservation Priority
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            In our culture, when a breadwinner falls chronically ill, the entire household bears the emotional and financial burden.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-center sm:text-left">
            <div className="text-3xl font-black text-rose-600">4.2M+</div>
            <h3 className="text-base font-bold text-slate-900">Diagnosed Filipinos</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Over 4.2 million Filipinos live with diabetes, while an estimated <strong>46% remain completely undiagnosed</strong> due to relying solely on painless, lagging tests.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-center sm:text-left">
            <div className="text-3xl font-black text-amber-600">10-15 Years</div>
            <h3 className="text-base font-bold text-slate-900">Silent Compensation Window</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              <strong>Hyperinsulinemia</strong> develops a decade before fasting blood sugar rises, giving families a crucial window to reverse resistance naturally.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-2 text-center sm:text-left">
            <div className="text-3xl font-black text-teal-600">₱350,000+</div>
            <h3 className="text-base font-bold text-slate-900">Annual Dialysis Cost</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              End-stage complications quickly bankrupt working families. Daily manual monitoring and ancestral food choices cost pennies compared to tertiary clinical care.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PILLAR B: THE RESOURCE & TOOL HUB (PASSIVE CONVERSION GATEWAY)            */}
      {/* ========================================================================= */}
      <section id="resources" className="scroll-mt-12 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block bg-indigo-50 text-indigo-900 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-indigo-200">
            🛠️ Community Blueprints &amp; Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Free Community Tools &amp; Actionable Blueprints
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Choose the path tailored to where you are today. Both resources are open-access and designed for immediate household adoption.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: The Biomarker Focus -> /insulin-reset */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-purple-200">
                🧬 The Biomarker Focus
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                The 21-Day Insulin Reset Blueprint
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Struggling with sudden 3 PM energy crashes, stubborn midsection fat, or persistent brain fog? Download our free, jargon-free metabolic checklist based on modern cell biology.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Identifies 4 silent hyperinsulinemia warning alarms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Explains why normal fasting sugar tests can deceive</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Provides 4 immediate nutritional shifts to apply tonight</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/insulin-reset"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-700"
              >
                <span>Read the Insulin Reset Protocol</span>
                <span className="text-lg">➔</span>
              </Link>
            </div>
          </div>

          {/* Card 2: The Software Focus -> /glycosense */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-teal-200">
                📱 The Software Focus
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                The GlycoSense Health Dashboard
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Securely turn your manual blood sugar logs into clean, automated digital trend lines. Instantly pinpoint local Filipino food triggers and export structured reports for your doctor.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Automates trend lines from affordable finger-prick logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Isolates specific Pinoy staple food triggers (kanin, pancit)</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>One-click export of doctor-ready PDF clinical summaries</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/glycosense"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-teal-700 hover:bg-teal-800 text-white font-black text-sm sm:text-base rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-teal-600"
              >
                <span>Explore GlycoSense Dashboard</span>
                <span className="text-lg">➔</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PILLAR D: ADVANCED GEO / AEO DIRECT ANSWER KNOWLEDGE PARADIGM             */}
      {/* ========================================================================= */}
      <section className="bg-slate-100 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-300">
            📖 Direct Clinical Definitions &amp; Science
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Metabolic Health Essentials for Filipino Families
          </h2>
          <p className="text-sm text-slate-600">
            Clear, authoritative answers structured for patients, carers, and AI answer engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-sm text-slate-700 leading-relaxed">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              What is the root cause of metabolic decline in the Philippines?
            </h3>
            <p>
              <strong>Insulin resistance</strong> is the primary driver behind chronic metabolic decline in the Philippines. It occurs when muscle and liver cells stop responding efficiently to insulin, compelling the pancreas to secrete escalating amounts of insulin (<strong>hyperinsulinemia</strong>) to store dietary glucose.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Why do standard fasting glucose tests fail to catch early damage?
            </h3>
            <p>
              Fasting blood sugar is the <strong>last biomarker to deteriorate</strong>. For 10 to 15 years, excessive insulin levels hold fasting glucose in a seemingly &ldquo;normal&rdquo; range while silently driving <strong>visceral adiposity</strong>, vascular stiffness, and fatty liver infiltration.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              How does functional skeletal muscle clearance blunt post-meal surges?
            </h3>
            <p>
              Engaging in 10 to 15 minutes of low-intensity movement (such as a casual walk) immediately following carbohydrate-dense meals recruits <strong>functional skeletal muscle clearance</strong> via GLUT4 translocation, blunting postprandial glycemic excursions without demanding excess pancreatic insulin.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              How do ancestral Pinoy food principles restore insulin sensitivity?
            </h3>
            <p>
              Ancestral Filipino cuisine prioritized whole fish, pasture-raised meats, leafy vegetables (malunggay, kangkong), and unadulterated coconut fats. Returning to these nutrient-dense staples while curbing modern refined seed oils and ultra-processed sugars naturally halts metabolic dysfunction.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PILLAR E: FREQUENTLY ASKED QUESTIONS (FAQ SCHEMA EMBEDDED)                */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            ❓ Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-slate-600">
            Answers to common questions asked by Filipino patients, family breadwinners, and caregivers.
          </p>
        </div>

        <div className="space-y-4 max-w-3xl mx-auto">
          {faqSchema.mainEntity.map((item: any, idx: number) => (
            <div
              key={idx}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2"
            >
              <h3 className="text-base font-bold text-slate-900">
                {item.name}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {item.acceptedAnswer.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* RECENT EDUCATIONAL ARTICLES                                               */}
      {/* ========================================================================= */}
      {articles.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                Latest Learning Materials &amp; Evidence Guides
              </h2>
              <p className="text-sm text-slate-600">
                Practical, evidence-based guides written for Filipino households.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
            >
              View all guides &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div
                key={article._id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                    <Link href={`/blog/${article.slug}`} className="hover:text-teal-700">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt || article.metaDescription}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                  >
                    <span>Read guide</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TRUST & INSTITUTIONAL COMPLIANCE FOOTER MARKER                            */}
      {/* ========================================================================= */}
      <section className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center space-y-2">
        <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>Secure processing fully compliant with the Philippine Data Privacy Act of 2012 (RA 10173).</span>
        </p>
        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          DiabetesCare PH is an independent community advocacy and health literacy initiative. Data entered across our ecosystem is user-owned, encrypted, and never sold to third parties or insurance providers.
        </p>
      </section>
    </div>
  );
}
