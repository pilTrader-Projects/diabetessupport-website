import { Metadata } from 'next';
import Link from 'next/link';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { LearningResourceModel } from '@/models/LearningResource';
import { IPost } from '@/types/blog';
import { SITE_CONFIG } from '@/config/constants';
import { buildHomeMedicalOrgSchema, buildCommunityHomeFaqSchema } from '@/lib/schema';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Before the Numbers — Philippines | Preventative Metabolic Health for Filipino Families',
  description:
    'The Philippine edition of Before the Numbers. Empowering Filipino breadwinners and families with ancestral nutrition blueprints, early metabolic warning signs, and zero-cost tracking tools before diagnosis strikes.',
  keywords: [
    'before the numbers philippines',
    'diabetes support philippines',
    'reverse insulin resistance pinoy',
    'the hidden metabolic clock',
    'tracking blood sugar free app',
    'filipino low carb guide',
    'chronic disease prevention',
    'RA 10173 medical privacy',
  ],
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}/ph`,
  },
  openGraph: {
    title: 'Before the Numbers — Philippines | Preventative Metabolic Health',
    description:
      'Empowering Filipino breadwinners with free ancestral nutrition guides, community support, and zero-cost blood sugar tracking.',
    url: `https://${SITE_CONFIG.domain}/ph`,
    siteName: 'Before the Numbers Philippines',
    locale: 'en_PH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Before the Numbers — Philippines',
    description:
      'Protecting Filipino family wealth through preventative metabolic health and early awareness.',
  },
};

/**
 * Philippines Regional Page (/ph).
 *
 * @usecase Dedicated regional hub for Before the Numbers Philippines, providing local metabolic reality statistics, culturally familiar food context, ancestral nutrition guides, and breadwinner wealth protection.
 * @returns {Promise<JSX.Element>} Rendered Philippine edition page.
 */
export default async function PhilippinePilotPage(): Promise<React.JSX.Element> {
  const orgSchema = buildHomeMedicalOrgSchema();
  const faqSchema = buildCommunityHomeFaqSchema();

  let rawPosts: any[] = [];
  let rawResources: any[] = [];
  try {
    await dbConnect();
    [rawPosts, rawResources] = await Promise.all([
      PostModel.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
      LearningResourceModel.find({ status: 'published' })
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),
    ]);
  } catch (err) {
    console.error('Error retrieving documents for Philippine pilot page:', err);
  }

  const articles: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    category: doc.category?.toString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
  }));

  const fallbackFeaturedResources = [
    {
      title: 'The Root Cause of Insulin Resistance & Hyperinsulinemia',
      slug: 'the-root-cause-of-insulin-resistance',
      type: 'video',
      authorityName: 'Dr. Jason Fung',
      authorityTitle: 'Nephrologist & Author',
      duration: '18 min',
      summary: 'Clinical breakdown explaining why standard fasting blood sugar tests miss the first 10-15 years of pancreatic hypersecretion.',
    },
    {
      title: 'Reversing Type 2 Diabetes with Dietary Carbohydrate Restriction',
      slug: 'virta-health-clinical-trial-2-year',
      type: 'study',
      authorityName: 'Dr. Sarah Hallberg',
      authorityTitle: 'Clinical Trial Lead (Virta Health)',
      duration: 'Clinical Study',
      summary: 'Longitudinal clinical evidence demonstrating significant diabetes remission, HbA1c normalization, and medication de-prescription.',
    },
    {
      title: 'The Diabetes Code: Prevent and Reverse Type 2 Naturally',
      slug: 'the-diabetes-code-jason-fung',
      type: 'book',
      authorityName: 'Dr. Jason Fung',
      authorityTitle: 'Bestselling Medical Author',
      duration: 'Book & Protocol',
      summary: 'Essential lifestyle blueprint explaining intermittent fasting protocols and low-glycemic dietary interventions.',
    },
  ];

  const featuredResources = rawResources.length > 0
    ? rawResources.map((r: any) => ({
        title: r.title,
        slug: r.slug,
        type: r.type || 'video',
        authorityName: r.authorityName || 'Medical Authority',
        authorityTitle: r.authorityTitle || 'Clinical Specialist',
        duration: r.duration || 'Evidence Guide',
        summary: r.summary || 'Evidence-based metabolic health lecture and research.',
      }))
    : fallbackFeaturedResources;

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

      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-4 sm:pt-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-amber-300 shadow-xs">
          <span>🇵🇭</span>
          <span>Before the Numbers &bull; Philippines</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
          Protecting Filipino Family Wealth Through{' '}
          <span className="text-teal-700 underline decoration-teal-300">
            Preventative Metabolic Health.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
          Before the Numbers provides dedicated health awareness and practical metabolic education for the Philippines. We empower Filipino breadwinners, families, and caregivers with practical ancestral nutrition blueprints, local food trigger guides, and free tracking tools—before a diagnosis forces unexpected hardship.
        </p>

        {/* CTA Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto">
          <a
            href="#resources"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-base rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <span>Explore Resources</span>
            <span className="text-lg">&darr;</span>
          </a>
          <Link
            href="/community"
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-900 font-black text-base rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-300 cursor-pointer"
          >
            <span>Join Pinoy Community</span>
            <span className="text-lg">👥</span>
          </Link>
        </div>

        <p className="text-xs text-slate-500 pt-1">
          Philippines Edition • 100% Free Forever • Global Movement: <Link href="/?edition=global" className="underline text-teal-700 font-semibold hover:text-teal-900">Before the Numbers Home (Global)</Link>
        </p>
      </section>

      {/* Transparent Philippine Reality Statistics */}
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

      {/* Cultural Food Context Without Extremism */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="space-y-3 max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-3 py-1 rounded-full border border-amber-300">
            🍚 Cultural Context &bull; Action Without Extremism
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Understanding the Filipino Plate: Balance Over Demonization
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
            Rice, bread, noodles, and sweetened drinks are everyday fixtures of Filipino family gatherings. Our movement does not demonize carbohydrates or ancestral culture. Instead, we teach practical portion awareness, meal composition (pairing carbs with proteins and fiber), and simple post-meal walks that help your muscles clear glucose without punishing crash diets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
            <span className="text-2xl">🌱</span>
            <h3 className="font-bold text-slate-900 text-sm">Ancestral Greens &amp; Fats</h3>
            <p className="text-xs text-slate-600">Reclaiming malunggay, kangkong, and pure coconut fats that nourished our grandparents.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
            <span className="text-2xl">🚶</span>
            <h3 className="font-bold text-slate-900 text-sm">Post-Meal Walking</h3>
            <p className="text-xs text-slate-600">A 15-minute gentle stroll after lunch activates GLUT4 glucose uptake without spiking insulin.</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs space-y-1">
            <span className="text-2xl">📊</span>
            <h3 className="font-bold text-slate-900 text-sm">Targeted Tracking</h3>
            <p className="text-xs text-slate-600">Checking 1 to 2 hours after local staples identifies your specific household triggers.</p>
          </div>
        </div>
      </section>

      {/* Community Blueprints & Tools */}
      <section id="resources" className="scroll-mt-12 space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block bg-indigo-50 text-indigo-900 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-indigo-200">
            🛠️ Actionable Tools &amp; Blueprints
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Free Community Tools &amp; Actionable Blueprints
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Tailored for Filipino households, completely open-access and zero commercial barrier.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Flagship Guide */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-purple-200">
                ⏱️ Flagship Educational Framework
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                The Hidden Metabolic Clock
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Why &ldquo;normal&rdquo; blood sugar isn&apos;t the whole story. Download our free 8-page guide explaining insulin resistance and the 4 early warning clues in Filipino households.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>4 silent hyperinsulinemia alarms</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Why fasting glucose lags behind</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Practical Filipino nutritional shifts</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/hidden-clock"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-700"
              >
                <span>Read The Hidden Clock</span>
                <span className="text-base">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 2: The Tracking Tool -> /glycosense */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-teal-200">
                📱 Companion Digital Tool
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                GlycoSense Health Dashboard
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Turn manual blood sugar logs into automated digital trend lines. Isolate Filipino food triggers and export doctor-ready summaries.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Automates trend lines from finger-prick logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Pinpoint local Pinoy food spikes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Philippine RA 10173 privacy compliant</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/glycosense"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-teal-700 hover:bg-teal-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-teal-600"
              >
                <span>Explore GlycoSense</span>
                <span className="text-base">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 3: The Learning Hub -> /learn */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-amber-200">
                🎓 Global Evidence Hub
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Learning Materials &amp; Evidence
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Access curated video breakdowns, clinical trials, and medical authority lectures explaining root metabolic health.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>50+ Expert lectures &amp; trials</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Peer-reviewed clinical evidence</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Save items to &ldquo;My Library&rdquo;</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/learn"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-700"
              >
                <span>Browse Learning Hub</span>
                <span className="text-base">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            ❓ Common Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions &bull; Philippines
          </h2>
          <p className="text-sm text-slate-600">
            Answers for Filipino patients, family breadwinners, and caregivers.
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

      {/* Trust & Data Privacy Compliance */}
      <section className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center space-y-2">
        <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>Secure processing fully compliant with the Philippine Data Privacy Act of 2012 (RA 10173).</span>
        </p>
        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Before the Numbers is an independent health awareness and metabolic education movement. Data entered across our ecosystem is user-owned, encrypted, and never sold to third parties or insurance providers.
        </p>
      </section>
    </div>
  );
}
