import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';

export const metadata: Metadata = {
  title: 'Why We Started This Mission: The Founder\'s Story | DiabetesCare PH',
  description:
    'The personal story behind DiabetesCare PH: how family loss, lived experience with diabetes, and Filipino culture sparked an urgent advocacy for early metabolic awareness.',
  alternates: {
    canonical: '/about/story',
  },
};

/**
 * Full Founder Story & Mission Page.
 *
 * @usecase Unabridged personal narrative of the founder detailing the loss of Chris,
 * family lived experience with diabetes, cultural dietary realities, the advocacy mission,
 * and clear action pathways for readers.
 * Styled with DiabetesCare PH signature brand theme (blue-800 to purple-900 to pink-600 gradient-kit-panel).
 */
export default function FounderStoryPage() {
  const storySchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Why We Started This Mission: We Don\'t Want Families to Discover Diabetes Too Late',
    description:
      'The personal story behind DiabetesCare PH: how family loss, lived experience with diabetes, and Filipino culture sparked an urgent advocacy for early metabolic awareness.',
    author: {
      '@type': 'Person',
      name: 'Bong Bungalan Jr.',
      jobTitle: 'Founder & Advocate',
      url: `https://${SITE_CONFIG.domain}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DiabetesCare PH',
      url: `https://${SITE_CONFIG.domain}`,
      logo: `https://${SITE_CONFIG.domain}/images/logo.png`,
    },
    mainEntityOfPage: `https://${SITE_CONFIG.domain}/about/story`,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12 text-slate-800">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storySchema) }}
      />

      {/* Header */}
      <header className="space-y-4 border-b border-slate-200 pb-8 text-center sm:text-left">
        <Link
          href="/about"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900 transition-colors uppercase tracking-wider"
        >
          <span>&larr;</span> Back to About Us
        </Link>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Why We Started This Mission
        </h1>
        <p className="text-lg sm:text-xl font-bold text-indigo-900 leading-snug">
          We Don&apos;t Want Families to Discover Diabetes Too Late
        </p>

        {/* Founder Byline */}
        <div className="flex items-center justify-center sm:justify-start gap-3 pt-3">
          <div className="w-11 h-11 rounded-full bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-900 font-bold text-sm shadow-sm">
            BB
          </div>
          <div className="text-left">
            <p className="text-slate-900 font-bold text-sm">Bong Bungalan Jr.</p>
            <p className="text-indigo-700 text-xs font-semibold">Founder &amp; Advocate &bull; 5 min read</p>
          </div>
        </div>
      </header>

      {/* Section 1: Chris */}
      <section className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700">
        <p className="text-lg sm:text-xl font-medium text-slate-900 leading-relaxed italic border-l-4 border-indigo-600 pl-4 py-1 bg-slate-50 rounded-r-lg">
          There are moments in life that change the way you see things forever.
        </p>
        <p>
          For me, one of those moments came when someone I knew—a young man named <strong className="text-slate-900 font-bold">Chris</strong>, the son of my cousin—lost his life to diabetes.
        </p>
        <p>Chris was only in his mid-30s.</p>
        <p>
          His diabetes had progressed to a devastating point, eventually leading to massive complications and organ failure. At just <strong className="text-rose-700 font-bold">36 years old, he was gone</strong>.
        </p>
        <p>What I remember most was not simply the disease itself.</p>
        <p className="text-slate-900 font-semibold text-lg">
          It was seeing a mother lose her son.
        </p>
        <p>That experience was heartbreaking—and deeply unsettling.</p>
        <p>
          Because suddenly, diabetes was no longer just a diagnosis written on a medical chart. It was a family watching a loved one deteriorate. It was emotional pain that no family should have to experience. And it was also the financial burden that comes when a serious illness reaches its advanced stages: hospitalizations, medications, procedures, lost income, and years of trying to keep someone alive and functioning.
        </p>
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-xl my-6">
          <p className="text-amber-950 font-bold text-base sm:text-lg">
            And then I began asking a question:
          </p>
          <p className="text-amber-900 text-lg sm:text-xl font-extrabold mt-1">
            How does something that can remain so quiet for years eventually become this devastating?
          </p>
        </div>
      </section>

      {/* Section 2: Personal */}
      <section className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          The Question Became Personal
        </h2>
        <p>At the time, my wife had already been living with diabetes for quite some time.</p>
        <p>And honestly, I wasn&apos;t taking it as seriously as I should have.</p>
        <p className="font-medium text-slate-800">She seemed okay.</p>
        <p>
          Life was moving along. We were eating the way many Filipino families eat. Rice was part of almost every meal. There were pancit, bread, sweets, celebrations, birthdays, holidays, and all the food that comes with being Filipino.
        </p>
        <p className="font-semibold text-slate-900">
          Diabetes was there—but it didn&apos;t feel like an emergency.
        </p>
        <p className="text-rose-800 font-bold">Until Chris died.</p>
        <p>
          Not long after that, I became particularly concerned when my wife started losing weight without intentionally changing her diet or lifestyle.
        </p>
        <p className="font-semibold text-slate-900">That got my attention.</p>
        <p>I started asking questions I should have asked much earlier:</p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
          <ul className="space-y-3 font-semibold text-slate-800">
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-lg leading-none mt-1">?</span>
              <span>What exactly is happening inside the body when someone develops diabetes?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-lg leading-none mt-1">?</span>
              <span>What does the pancreas actually do?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-lg leading-none mt-1">?</span>
              <span>What is insulin?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-lg leading-none mt-1">?</span>
              <span>What is insulin resistance?</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-600 font-bold text-lg leading-none mt-1">?</span>
              <span>Why can blood sugar appear manageable for a period of time while something deeper may already be going wrong?</span>
            </li>
            <li className="flex items-start gap-3 text-indigo-950 font-bold">
              <span className="text-indigo-700 font-bold text-lg leading-none mt-1">✓</span>
              <span>And most importantly: Can we recognize the problem earlier—before it reaches the point where the consequences become devastating?</span>
            </li>
          </ul>
        </div>
        <p className="font-medium text-slate-900">Those questions changed everything for me.</p>
      </section>

      {/* Section 3: Beyond the Glucometer */}
      <section className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          I Started Looking Beyond the Number on the Glucometer
        </h2>
        <p>
          The more I learned about metabolism, insulin, glucose regulation, and insulin resistance, the more I realized that diabetes is not simply a story about eating too much sugar.
        </p>
        <p className="text-lg font-bold text-indigo-950">
          It is a story about how the body manages energy.
        </p>
        <p>
          Our educational material on diabetes explains this progression as a process: insulin normally helps glucose enter cells, but when insulin resistance develops, the pancreas has to compensate by producing more insulin. Over time, pancreatic &beta;-cells can lose their ability to compensate adequately, allowing blood glucose to rise into the diabetic range.
        </p>
        <p>That realization gave me a completely different perspective.</p>
        <p className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded-r-lg font-bold text-indigo-950">
          I began to understand that the diagnosis is not necessarily where the story begins.
        </p>
        <p>There can be years of metabolic changes before diabetes becomes obvious.</p>
        <p className="font-semibold text-slate-900">
          And that is precisely where I believe awareness matters most.
        </p>
      </section>

      {/* Section 4: Cultural Realities */}
      <section className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          But Then I Discovered Another Problem
        </h2>
        <p>Knowing what needs to change is one thing.</p>
        <p className="font-semibold text-slate-900">Actually changing it is another.</p>
        <p>We are Filipino.</p>
        <p>Food is deeply connected to our culture, our families, and our celebrations.</p>
        <p>Rice is not merely food on a plate. It is part of everyday life.</p>
        <p>
          Then there is pancit, bread, desserts, sweetened drinks, merienda, birthday celebrations, fiestas, Christmas gatherings, family reunions—and the simple Filipino habit of showing love through food.
        </p>
        <p>
          For someone trying to manage diabetes or reduce metabolic risk, these realities can make the journey incredibly difficult.
        </p>
        <div className="bg-slate-100 rounded-2xl p-6 sm:p-8 space-y-4 border border-slate-200">
          <p className="font-bold text-slate-900 text-lg sm:text-xl">
            And that&apos;s when I realized something important:
          </p>
          <blockquote className="border-l-4 border-slate-400 pl-4 py-1 text-slate-800 font-semibold space-y-3">
            <p>You cannot simply tell people, &ldquo;Stop eating this.&rdquo;</p>
            <p>You have to help them understand <strong>why</strong>.</p>
            <p>You have to give people practical knowledge they can actually use in the context of Filipino life.</p>
            <p>You have to make metabolic health understandable before people are already facing serious complications.</p>
          </blockquote>
        </div>
        <p>And you have to recognize that changing long-established habits is not a one-time decision.</p>
        <p className="text-slate-900 font-extrabold text-lg">
          It is a battle fought meal by meal, day by day, celebration by celebration.
        </p>
      </section>

      {/* Section 5: Raising the Flag (Website Signature Brand Card) */}
      <section className="space-y-6 pt-2">
        <div className="bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel text-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/20 space-y-6">
          <div className="space-y-3">
            <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
              🚩 ADVOCACY MANIFESTO
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              This Is Why We Are Raising the Flag
            </h2>
          </div>

          <div className="space-y-3 text-purple-100 text-base sm:text-lg leading-relaxed">
            <p>This advocacy was born from those experiences.</p>
            <p>From witnessing families struggle.</p>
            <p>From watching loved ones become critically ill.</p>
            <p>From seeing the emotional devastation that disease can bring into a household.</p>
            <p>From realizing how expensive advanced illness can become—not only financially, but emotionally and physically.</p>
            <p>And from experiencing firsthand how difficult it can be to manage diabetes once the problem has already become established.</p>
          </div>

          <div className="border-t border-white/15 pt-6 space-y-4">
            <p className="text-xl sm:text-2xl font-black text-white">So I am raising a flag.</p>
            <p className="text-amber-300 font-bold text-lg">Not a flag of fear. A flag of awareness.</p>

            <div className="space-y-3 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-inner">
              <p className="font-semibold text-white">&ldquo;Don&apos;t wait until the disease becomes impossible to ignore.&rdquo;</p>
              <p className="font-semibold text-white">&ldquo;Don&apos;t wait until a loved one is in critical condition.&rdquo;</p>
              <p className="font-semibold text-white">&ldquo;Don&apos;t wait until the complications have already taken their toll.&rdquo;</p>
            </div>

            <p className="text-white text-base sm:text-lg font-bold leading-relaxed pt-2">
              There is another path: understand what is happening inside your body, recognize the warning signs early, and start making informed changes while there is still an opportunity to act.
            </p>
            <p className="text-purple-200 text-sm italic">That is the spirit behind this advocacy.</p>
          </div>
        </div>
      </section>

      {/* Section 6: Our Mission */}
      <section className="space-y-6 pt-2 text-base sm:text-lg leading-relaxed text-slate-700">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Our Mission: Earlier Awareness. Better Understanding. Better Decisions.
        </h2>
        <p>
          This platform exists to help Filipinos understand metabolic health before diabetes and its complications become the center of their lives.
        </p>
        <p>We want to explain the science in language ordinary families can understand.</p>
        <p>
          We want to talk about insulin resistance, glucose regulation, nutrition, physical activity, sleep, stress, and other factors that influence metabolic health.
        </p>
        <p>We want to make the invisible processes happening inside the body less mysterious.</p>
        <p className="font-bold text-slate-900 text-lg">
          And most importantly, we want to encourage people to <span className="text-indigo-700 underline decoration-indigo-500 decoration-2">pay attention early</span>.
        </p>
        <p>
          Because your blood sugar number is not merely a number. It is information. Your HbA1c is information. Your waistline, blood pressure, activity level, eating patterns, sleep, and other aspects of your health can provide information too.
        </p>
        <p className="font-medium text-slate-900">
          The earlier you understand what those signals mean, the more informed your decisions can be.
        </p>
      </section>

      {/* Section 7: From Personal Loss to Collective Action */}
      <section className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sharing What We Learned with Every Filipino Home
        </h2>
        <p>
          Simply hoping someone will remain &ldquo;okay&rdquo; is not a medical strategy.
        </p>
        <p>
          When you watch someone close to you deteriorate from something that began silently decades earlier, you realize that knowledge cannot remain locked away in medical textbooks or private grief.
        </p>
        <p className="font-semibold text-slate-900">It has to be shared openly, freely, and relentlessly.</p>
        <div className="bg-indigo-50/70 border-l-4 border-indigo-600 p-5 rounded-r-xl space-y-2">
          <p>
            Somewhere out there right now is another Filipino family whose parent, breadwinner, spouse, or child may be quietly developing metabolic dysfunction without knowing it:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 text-sm sm:text-base pt-1">
            <li>Maybe they still feel energetic and strong.</li>
            <li>Maybe their fasting blood sugar was only slightly borderline on their last checkup.</li>
            <li>Maybe their doctor casually told them to &ldquo;just watch what they eat.&rdquo;</li>
            <li>Maybe they have zero obvious symptoms today.</li>
          </ul>
        </div>
        <p className="font-bold text-slate-900 text-lg">
          That is why early metabolic literacy is the single highest-return investment a provider can make for their household.
        </p>
      </section>

      {/* Section 8: Act Before Crisis */}
      <section className="space-y-5 text-base sm:text-lg leading-relaxed text-slate-700 pt-2">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          We Want to Help People Act Before the Crisis
        </h2>
        <p>We cannot promise that every case of diabetes can be prevented.</p>
        <p>We cannot promise that every person can reverse their condition.</p>
        <p className="font-semibold text-slate-900">
          And we should never replace qualified medical care with internet advice.
        </p>
        <div className="space-y-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl p-6 sm:p-8">
          <p className="font-bold text-indigo-950 text-lg">What we can and will do:</p>
          <ul className="space-y-2 text-slate-800 font-medium">
            <li className="flex items-center gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>We can help people understand what is happening under the hood.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>We can help people ask smarter, more direct questions to their doctors.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>We can help families recognize that metabolic health deserves attention long before an emergency room visit.</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-indigo-600 font-bold">✓</span>
              <span>And we can encourage sustainable, culturally realistic food choices without stripping joy from family celebrations.</span>
            </li>
          </ul>
        </div>
        <p className="text-lg font-bold text-slate-900">That is the revolution we are advocating.</p>
        <p>
          Not a revolution against doctors. Not a revolution against medicine. Not a revolution against food.
        </p>
        <p className="text-xl font-black text-indigo-950">
          It is a revolution against ignorance and complacency.
        </p>
        <p>It is the decision to stop treating metabolic disease as something that only matters after the diagnosis.</p>
        <p className="font-bold text-slate-900">It is the decision to start paying attention earlier.</p>
      </section>

      {/* Section 9: Our Message Is Simple (Website Signature Brand Card matching Reference Image) */}
      <section className="space-y-6 pt-2">
        <div className="bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel text-white rounded-3xl p-8 sm:p-10 space-y-6 shadow-2xl border border-white/20">
          <div className="space-y-3">
            <span className="inline-block bg-white/20 text-white text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-white/30 backdrop-blur-md shadow-sm">
              💡 CORE ADVOCACY PRINCIPLE
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight drop-shadow-sm">
              Our Message Is Simple
            </h2>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-amber-300 drop-shadow-sm">
              Don&apos;t cross the road blindly.
            </p>
          </div>

          <ul className="space-y-3 text-purple-100 text-base sm:text-lg">
            <li className="flex items-start gap-3">
              <span className="text-amber-300 font-bold text-lg mt-0.5">•</span>
              <span>If you can see the warning signs, learn what they mean.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-300 font-bold text-lg mt-0.5">•</span>
              <span>If you have risk factors, don&apos;t ignore them.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-300 font-bold text-lg mt-0.5">•</span>
              <span>If you&apos;ve been diagnosed with diabetes, don&apos;t give up.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-300 font-bold text-lg mt-0.5">•</span>
              <span>If someone you love has diabetes, learn alongside them.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-300 font-bold text-lg mt-0.5">•</span>
              <span>And if you&apos;re currently healthy, don&apos;t assume that means you never need to think about metabolic health.</span>
            </li>
          </ul>

          <div className="border-t border-white/15 pt-6 space-y-2">
            <p className="text-purple-200 font-medium">
              Because prevention, early detection, and informed management begin with one thing:
            </p>
            <p className="text-2xl font-extrabold text-white">Awareness.</p>
            <p className="text-purple-200">That is why we are here. That is why this advocacy exists.</p>
          </div>

          {/* Frosted Glass Callout Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-6 sm:p-8 text-center space-y-3 shadow-2xl">
            <span className="inline-block bg-amber-400/25 text-amber-200 text-xs font-black uppercase tracking-widest px-3.5 py-1 rounded-full border border-amber-300/40 backdrop-blur-sm">
              THE FLAG WE CONTINUE RAISING
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-snug drop-shadow-sm">
              Don&apos;t wait for the disease to become loud before you listen to what your body has been telling you quietly for years.
            </h3>
          </div>
        </div>
      </section>

      {/* Section 10: Where Do We Go From Here? Next Steps Action Pathways */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-3xl p-6 sm:p-10 space-y-8 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1 rounded-full inline-block shadow-sm">
            Take Action Now
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Where Do We Go From Here?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Awareness is meaningless without practical action. We have built 100% free tools and resources to help you protect yourself and your family right now.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Insulin Reset Funnel */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-purple-300 transition-all">
            <div className="space-y-2">
              <span className="text-3xl">📋</span>
              <h3 className="font-bold text-slate-900 text-lg leading-snug">
                Insulin Risk Checklist
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take our 60-second interactive symptom audit and get the Free 3-Page Filipino Metabolic Cheat Sheet.
              </p>
            </div>
            <Link
              href="/insulin-reset"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 hover:from-blue-800 hover:via-purple-800 hover:to-pink-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <span>Take Free Checklist</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {/* Card 2: Community Forum */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-purple-300 transition-all">
            <div className="space-y-2">
              <span className="text-3xl">💬</span>
              <h3 className="font-bold text-slate-900 text-lg leading-snug">
                Join the Community
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions, share lived experiences, and learn together with fellow Filipino patients and families.
              </p>
            </div>
            <Link
              href="/community"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 hover:from-blue-800 hover:via-purple-800 hover:to-pink-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <span>Visit Discussions</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {/* Card 3: GlycoSense App */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100/90 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-purple-300 transition-all">
            <div className="space-y-2">
              <span className="text-3xl">📱</span>
              <h3 className="font-bold text-slate-900 text-lg leading-snug">
                GlycoSense Companion
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log daily finger-prick glucose checks and instantly generate doctor-ready PDF reports without subscription lock-ins.
              </p>
            </div>
            <Link
              href="/glycosense"
              className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-700 via-purple-700 to-pink-600 hover:from-blue-800 hover:via-purple-800 hover:to-pink-700 text-white font-extrabold text-xs px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <span>Explore GlycoSense</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="pt-6 border-t border-slate-200 flex justify-between items-center text-xs sm:text-sm font-bold text-indigo-700">
        <Link href="/about" className="hover:underline flex items-center gap-1">
          <span>&larr;</span> Back to About Us
        </Link>
        <Link href="/contact" className="hover:underline">
          Contact the Team &rarr;
        </Link>
      </footer>
    </article>
  );
}
