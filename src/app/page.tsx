import { Metadata } from 'next';
import Link from 'next/link';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { LearningResourceModel } from '@/models/LearningResource';
import { IPost } from '@/types/blog';
import { SITE_CONFIG } from '@/config/constants';
import { buildOrganizationSchema, buildGlobalHomeFaqSchema } from '@/lib/schema';

export const revalidate = 60; // Refresh static page every 60 seconds

export const metadata: Metadata = {
  title: "Before the Numbers | Don't Wait for the Diagnosis",
  description:
    'Before the Numbers is a health-awareness and metabolic-health education movement helping you understand early signals and trajectories before a diagnosis forces you to.',
  keywords: [
    'before the numbers',
    'metabolic health education',
    'the hidden metabolic clock',
    'insulin resistance warning signs',
    'hyperinsulinemia early detection',
    'preventative health education',
    'glucose trajectory vs snapshot',
    'cardiometabolic awareness',
  ],
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}`,
  },
  openGraph: {
    title: "Before the Numbers | Don't Wait for the Diagnosis",
    description:
      'Understand your health before a diagnosis forces you to. Learn the early signals, know your trajectory, and make informed changes.',
    url: `https://${SITE_CONFIG.domain}`,
    siteName: SITE_CONFIG.author,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Before the Numbers | Don't Wait for the Diagnosis",
    description:
      'Learn the early metabolic signals, understand the numbers, and take informed action before a diagnosis becomes your first wake-up call.',
  },
};

/**
 * Global Master Brand Homepage (/).
 *
 * @usecase Serves as the primary public-facing advocacy and educational front door for Before the Numbers.
 * Follows the Before the Numbers Redesign Brief:
 * Master Brand: BEFORE THE NUMBERS
 * Tagline: Don't wait for the diagnosis.
 * Core Hierarchy: Understand your health before a diagnosis forces you to.
 * @returns {Promise<JSX.Element>} Rendered global homepage.
 */
export default async function HomePage(): Promise<React.JSX.Element> {
  const orgSchema = buildOrganizationSchema();
  const faqSchema = buildGlobalHomeFaqSchema();

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
    console.error('Error retrieving documents for master brand homepage:', err);
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

      {/* ========================================================================= */}
      {/* PHILIPPINE PILOT NOTICE BANNER                                            */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-orange-500/10 border border-amber-300/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <span className="text-2xl p-2 bg-amber-400/20 rounded-xl border border-amber-300/40">🇵🇭</span>
          <div>
            <p className="text-xs font-black text-amber-950 uppercase tracking-wider">
              Currently Piloting in the Philippines
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-snug">
              Looking for Philippine metabolic statistics, regional food triggers, and family wealth protection guides?
            </p>
          </div>
        </div>
        <Link
          href="/ph"
          className="whitespace-nowrap px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer border border-amber-500/30"
        >
          <span>Explore Philippine Pilot</span>
          <span>&rarr;</span>
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: MASTER BRAND HERO                                              */}
      {/* ========================================================================= */}
      <section className="text-center space-y-6 max-w-4xl mx-auto pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-950 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-indigo-200 shadow-xs">
          <span>⏳</span>
          <span>BEFORE THE NUMBERS &bull; HEALTH AWARENESS MOVEMENT</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight sm:leading-none">
          Don&apos;t Wait for the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600">
            Diagnosis.
          </span>
        </h1>

        <p className="text-xl sm:text-2xl font-bold text-slate-800 max-w-3xl mx-auto tracking-tight">
          Understand your health before a diagnosis forces you to.
        </p>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Learn the signals. Understand the numbers. Know your trajectory. Make informed changes. We help you recognize what may be happening in your metabolic health years before diagnostic numbers become a serious wake-up call.
        </p>

        {/* Primary and Secondary CTA Hierarchy */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-lg mx-auto" id="start-here">
          <a
            href="#framework"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-base rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
          >
            <span>Start Here: The Approach</span>
            <span className="text-lg">&darr;</span>
          </a>
          <Link
            href="/hidden-clock"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-600 hover:from-indigo-800 hover:via-purple-800 hover:to-pink-700 text-white font-black text-base rounded-2xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-white/20 cursor-pointer"
          >
            <span>The Hidden Metabolic Clock</span>
            <span className="text-lg">&rarr;</span>
          </Link>
        </div>

        <p className="text-xs text-slate-500 pt-1">
          Open-access health education movement &bull; 100% Free Forever &bull; Non-commercial advocacy
        </p>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: THE CORE ADVOCACY & ACTION FRAMEWORK                           */}
      {/* ========================================================================= */}
      <section id="framework" className="scroll-mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            🧭 The Advocacy Movement
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Warning &rarr; Awareness &rarr; Understanding &rarr; Action &rarr; Hope
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            The brand challenges the common habit of waiting for a formal medical diagnosis, offering a constructive, disciplined alternative to reclaim agency over your health.
          </p>
        </div>

        {/* 5-Step Action Framework */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">01</span>
            <h3 className="text-sm font-bold text-slate-900">MEASURE</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track what is relevant: glucose response, waist, pressure, and fasting markers.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">02</span>
            <h3 className="text-sm font-bold text-slate-900">UNDERSTAND</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interpret signals in full metabolic context, not single isolated lab numbers.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">03</span>
            <h3 className="text-sm font-bold text-slate-900">INTERVENE</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Make sustainable shifts in meal composition, timing, movement, and sleep.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">04</span>
            <h3 className="text-sm font-bold text-slate-900">MONITOR</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Observe trends over weeks and months rather than stressing single-day swings.
            </p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-1.5">
            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest block">05</span>
            <h3 className="text-sm font-bold text-slate-900">ADJUST</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Refine your habits based on objective biological feedback and clinical advice.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: THE 5 MESSAGING PILLARS                                        */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            💡 Core Principles
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            How We View Metabolic Health
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Grounded in scientific balance, human agency, and respectful education.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-2xl">⏳</div>
            <h3 className="text-base font-bold text-slate-900">Before Diagnosis</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A clinical diagnosis should not be the first time people become serious about their health. Understanding early signals preserves options and health agency.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-2xl">📈</div>
            <h3 className="text-base font-bold text-slate-900">Look Beyond One Number</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              A glucose number matters, but it is one component of a broader metabolic picture including insulin dynamics, triglycerides, visceral fat, and blood pressure.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-2xl">🔎</div>
            <h3 className="text-base font-bold text-slate-900">Recognize Early Signals</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mid-afternoon energy crashes, stubborn midsection gain, and sleep disruptions are clues worth discussing with your doctor—not self-diagnostic checklists.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-2xl">🧭</div>
            <h3 className="text-base font-bold text-slate-900">Trajectory Matters</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The question is not only where a number sits today, but whether your markers and risk factors are stable, improving, or drifting over multi-year windows.
            </p>
          </div>

          {/* Pillar 5 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-2xl">🥗</div>
            <h3 className="text-base font-bold text-slate-900">Action Without Extremism</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We do not demonize carbohydrates, rice, or individual foods. The focus is total metabolic context: meal composition, physical activity, and sustainable lifestyle.
            </p>
          </div>

          {/* Pillar 6 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="text-2xl">🌱</div>
            <h3 className="text-base font-bold text-slate-900">Hope and Agency</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Earlier understanding creates more opportunities to positively influence your trajectory. Our voice empowers through clarity rather than paralyzing with fear.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: ECOSYSTEM ARCHITECTURE & TOOLS                                 */}
      {/* ========================================================================= */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-block bg-teal-50 text-teal-900 text-xs font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-teal-200">
            🛠️ Frameworks &amp; Companion Tools
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Explore the Movement Ecosystem
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Free educational models, evidence hubs, and practical companion trackers to navigate your journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: The Hidden Metabolic Clock */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-purple-50 text-purple-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-purple-200">
                ⏱️ Flagship Educational Series
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                The Hidden Metabolic Clock
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                What may be happening before conventional glucose numbers change. Download the free 8-page educational framework explaining insulin resistance and the progression toward prediabetes.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>Conceptual progression of insulin resistance</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>Why fasting glucose numbers lag behind</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-indigo-600 font-bold">✓</span>
                  <span>Early physical warning clues to discuss</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/hidden-clock"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-slate-700"
              >
                <span>Read The Framework</span>
                <span className="text-base">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Companion Tracking -> /glycosense */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-teal-50 text-teal-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-teal-200">
                📱 Monitoring &amp; Tools
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                GlycoSense Companion
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A free, lightweight lifestyle tracking companion. Turn manual finger-prick glucose logs and blood pressure checks into clear visual trend lines and doctor-ready summaries.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Visual 7, 14, and 30-day glycemic trajectories</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Logs food triggers and lifestyle notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>100% private, user-owned, zero ads or sales</span>
                </li>
              </ul>
            </div>

            <div>
              <Link
                href="/glycosense"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-teal-700 hover:bg-teal-800 text-white font-black text-sm rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] border border-teal-600"
              >
                <span>Explore Companion Tool</span>
                <span className="text-base">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Evidence & Learning Hub -> /learn */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="inline-block bg-amber-50 text-amber-800 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-md border border-amber-200">
                🎓 Global Evidence Hub
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Learning Materials &amp; Evidence
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore curated medical lectures, peer-reviewed clinical studies, and metabolic science from leading clinicians including Dr. Fung, Dr. Bikman, and Dr. Attia.
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Curated video lectures &amp; podcast breakdowns</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Longitudinal clinical trial evidence &amp; books</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-teal-600 font-bold">✓</span>
                  <span>Save resources to your personalized &ldquo;My Library&rdquo;</span>
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

      {/* ========================================================================= */}
      {/* SECTION 5: CLINICAL DEFINITIONS & DIRECT SCIENTIFIC ANSWERS               */}
      {/* ========================================================================= */}
      <section className="bg-slate-100 border border-slate-200 rounded-3xl p-6 sm:p-10 space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-300">
            📖 Direct Clinical Definitions &amp; Science
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Understanding What Happens Before the Numbers
          </h2>
          <p className="text-sm text-slate-600">
            Disciplined, evidence-based answers structured for patients, families, and AI answer engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-sm text-slate-700 leading-relaxed">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Why do conventional fasting glucose tests miss early metabolic dysfunction?
            </h3>
            <p>
              Fasting blood sugar is often the <strong>last biomarker to cross diagnostic thresholds</strong>. For 10 to 15 years prior, the pancreas works in overdrive producing elevated insulin (<strong>hyperinsulinemia</strong>) to force glucose into resistant cells. Looking only at glucose ignores this underlying hormonal strain.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              What is the difference between a single glucose reading and a metabolic trajectory?
            </h3>
            <p>
              A single blood glucose snapshot only records where your blood sugar is at one instant. <strong>Metabolic trajectory</strong> assesses whether multiple interrelated markers—such as triglycerides, HDL, waist circumference, blood pressure, and post-meal glucose spikes—are drifting favorably or unfavorably over time.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              How does post-meal muscular movement clear glucose without demanding extra insulin?
            </h3>
            <p>
              Engaging in 10 to 15 minutes of gentle walking or functional movement after eating recruits <strong>GLUT4 glucose transporters</strong> directly through muscle contraction. This clears circulating carbohydrates directly into muscle tissue without requiring the pancreas to spike additional insulin.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Why does Before the Numbers emphasize sustainable change over food extremism?
            </h3>
            <p>
              Extremist diets demonizing entire cultural food groups frequently cause high friction, rebound binges, and social isolation. Sustainable metabolic restoration focuses on total context: pairing carbohydrates with protein and fiber, managing portion density, and prioritizing restful sleep and regular physical movement.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: CURATED LEARNING HUB PREVIEW & EVIDENCE VAULT                   */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-br from-blue-900 via-purple-950 to-pink-950 text-white rounded-3xl p-6 sm:p-10 overflow-hidden shadow-2xl border border-white/20 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/15 pb-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
              🔬 PEER-REVIEWED SCIENCE &amp; EXPERT AUTHORITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
              Curated Learning Materials &amp; Evidence Hub
            </h2>
            <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed">
              Explore clinical lectures, trial breakdowns, and dietary protocols from world-leading metabolic researchers—tailored to help you understand the root biology of healing.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/learn"
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black text-sm rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 group cursor-pointer border border-white/40"
            >
              <span>Open Learning Hub</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-bold text-purple-200 mr-1">Quick Browse:</span>
          <Link
            href="/learn?format=video"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <span>🎥</span>
            <span>Video Lectures</span>
          </Link>
          <Link
            href="/learn?format=study"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <span>🔬</span>
            <span>Clinical Studies</span>
          </Link>
          <Link
            href="/learn?format=podcast"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <span>🎙️</span>
            <span>Medical Podcasts</span>
          </Link>
          <Link
            href="/learn?format=book"
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5"
          >
            <span>📚</span>
            <span>Books &amp; Protocols</span>
          </Link>
          <Link
            href="/learn?format=saved"
            className="px-3.5 py-1.5 rounded-xl bg-amber-400/25 hover:bg-amber-400/35 text-amber-200 border border-amber-300/40 text-xs font-black backdrop-blur-md transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>🔖</span>
            <span>My Library</span>
          </Link>
        </div>

        {/* Featured 3-Column Resource Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredResources.map((res: any, idx: number) => {
            const isVideo = res.type === 'video';
            const isStudy = res.type === 'study';
            const isBook = res.type === 'book';

            const typeLabel = isVideo
              ? '🎥 Video Lecture'
              : isStudy
              ? '🔬 Clinical Study'
              : isBook
              ? '📖 Book & Protocol'
              : '🎙️ Podcast';

            const typeBadgeStyle = isVideo
              ? 'bg-pink-500/25 text-pink-200 border-pink-400/30'
              : isStudy
              ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/30'
              : isBook
              ? 'bg-amber-400/25 text-amber-200 border-amber-300/40'
              : 'bg-purple-400/25 text-purple-200 border-purple-300/40';

            return (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 hover:bg-white/15 transition-all flex flex-col justify-between space-y-4 group shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-sm ${typeBadgeStyle}`}>
                      {typeLabel}
                    </span>
                    <span className="text-[11px] text-purple-200 font-medium">
                      {res.duration}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-amber-300 font-bold block">
                      {res.authorityName}
                    </span>
                    <span className="text-[11px] text-purple-200/80 block">
                      {res.authorityTitle}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white line-clamp-2 group-hover:text-amber-200 transition-colors">
                    {res.title}
                  </h3>

                  <p className="text-xs text-purple-100/90 line-clamp-3 leading-relaxed">
                    {res.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/15">
                  <Link
                    href={`/learn?resource=${encodeURIComponent(res.slug)}`}
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 inline-flex items-center gap-1.5"
                  >
                    <span>{isVideo ? 'Watch Breakdown' : isStudy ? 'Read Findings' : 'Explore Protocol'}</span>
                    <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* "My Library" Personal Protocol Banner */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <span className="text-2xl p-3 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-amber-300 shadow-sm">🔖</span>
            <div>
              <span className="inline-block bg-amber-400/25 text-amber-200 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-amber-300/40 mb-1">
                PERSONALIZED PROTOCOL
              </span>
              <h3 className="text-base font-bold text-white">
                Build Your Personal Metabolic Protocol with &ldquo;My Library&rdquo;
              </h3>
              <p className="text-xs text-purple-100/90 mt-0.5 leading-relaxed">
                Bookmark any video lecture, clinical paper, or book across the hub. Access your curated favorites on any device without required passwords.
              </p>
            </div>
          </div>
          <Link
            href="/learn?format=saved"
            className="whitespace-nowrap px-5 py-2.5 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg hover:scale-105 transition-all flex items-center gap-1.5"
          >
            <span>View My Library</span>
            <span>&rarr;</span>
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: FREQUENTLY ASKED QUESTIONS                                     */}
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
            Clear, authoritative answers about our movement and educational approach.
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
                Practical, evidence-based guides to support your metabolic journey.
              </p>
            </div>
            <Link
              href="/learn"
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
                    <Link href={`/learn/${article.slug}`} className="hover:text-teal-700">
                      {article.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {article.excerpt || article.metaDescription}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={`/learn/${article.slug}`}
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
      {/* TRUST & DISCLAIMER FOOTER CARD                                            */}
      {/* ========================================================================= */}
      <section className="p-6 bg-slate-100 rounded-2xl border border-slate-200 text-center space-y-2">
        <p className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          <span>Zero-commercial barrier • User-owned data • Non-promotional educational movement.</span>
        </p>
        <p className="text-[11px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Before the Numbers is an independent health awareness and metabolic literacy initiative. Educational content is provided for informational purposes and does not substitute for individualized medical care.
        </p>
      </section>
    </div>
  );
}
