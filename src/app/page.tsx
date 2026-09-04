import { AWARENESS_PILLARS } from '@/config/constants';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { IPost } from '@/types/blog';
import Link from 'next/link';
import LeadMagnetCard from '@/components/LeadMagnetCard';

export const revalidate = 60; // Refresh static page every 60 seconds

/**
 * Clean & Minimalist Diabetes Awareness & Educational Campaign Home Page Component.
 *
 * @usecase Focuses purely on awareness, number-tracking education, and displaying imported MongoDB post articles.
 * @param None Page component receives no props.
 * @dependencies AWARENESS_PILLARS constants, dbConnect, PostModel.
 * @returns {Promise<JSX.Element>} Rendered clean, elegant awareness landing page with dynamic post articles.
 */
export default async function HomePage() {
  let rawPosts: any[] = [];
  try {
    await dbConnect();
    rawPosts = await PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();
  } catch (err) {
    console.error('Error fetching posts for HomePage:', err);
  }

  const articles: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    category: doc.category?.toString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
  }));

  return (
    <div className="space-y-20 pb-8">
      {/* Clean Hero Awareness Banner */}
      <section className="min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 py-8 sm:py-12">
        <span className="inline-block bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200">
          💡 Diabetes Awareness & Prevention Campaign
        </span>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Awareness and keeping track of your numbers will save you from <span className="text-rose-600 underline decoration-rose-300">devastating complications</span>.
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Diabetes is a silent killer that thrives when ignored. Because early high blood sugar causes no pain, millions live in status-quo comfort while irreversible vascular, kidney, and nerve damage develops beneath the surface.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="#progression"
            className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg hover:shadow-slate-900/20 transition-all text-base flex items-center gap-2"
          >
            <span>Know Your Target Numbers</span>
            <span>↓</span>
          </Link>
          <Link
            href="/blog"
            className="bg-teal-50 hover:bg-teal-100 text-teal-900 px-8 py-3.5 rounded-xl font-bold border border-teal-200 transition-all text-base"
          >
            Explore Articles &rarr;
          </Link>
        </div>

        <a
          href="#progression"
          aria-label="Scroll down to target numbers section"
          className="pt-6 inline-flex flex-col items-center gap-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer group"
        >
          <span className="text-xs font-semibold tracking-wider uppercase group-hover:translate-y-0.5 transition-transform">
            Target Metrics Below
          </span>
          <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </a>
      </section>

      {/* Target Numbers & Progression Section */}
      <section id="progression" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">
            The 3 Essential Numbers You Must Track
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-base">
            Regularly tracking these metrics exposes hidden blood sugar spikes long before permanent organ damage occurs.
          </p>
        </div>

        <div id="numbers" className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">3-Month Average</span>
              <span className="bg-teal-50 text-teal-800 text-xs font-bold px-3 py-1 rounded-full border border-teal-200">Key Indicator</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">&lt; 5.7%</div>
              <h3 className="font-bold text-slate-800 text-lg">HbA1c Blood Level</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measures your average blood glucose over the past 90 days. A level above 6.5% indicates diabetes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">Fasting Baseline</span>
              <span className="bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">Daily Metric</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">70-99 <span className="text-base font-medium text-slate-500">mg/dL</span></div>
              <h3 className="font-bold text-slate-800 text-lg">Fasting Blood Glucose</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measured first thing in the morning before eating. Catching fasting glucose above 100 mg/dL early gives you time to reverse progression.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4 hover:border-teal-400 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-teal-700 uppercase tracking-wider">2 Hours Post-Meal</span>
              <span className="bg-rose-50 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-200">Spike Warning</span>
            </div>
            <div className="space-y-1">
              <div className="text-4xl font-extrabold text-slate-900">&lt; 140 <span className="text-base font-medium text-slate-500">mg/dL</span></div>
              <h3 className="font-bold text-slate-800 text-lg">Postprandial Glucose</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Measures blood sugar 2 hours after meals to protect small blood vessels from oxidative stress.
            </p>
          </div>
        </div>
      </section>

      {/* Imported Post Articles Grid Section */}
      <section id="education" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div id="articles" className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Educational Articles</span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Latest Health Guides & Research
            </h2>
          </div>
          <Link
            href="/blog"
            className="text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            View All Articles ({articles.length}) &rarr;
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
            <p className="text-slate-500">No articles imported yet. Run `npm run migrate:wp` to import your WordPress posts.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <article
                key={article._id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:border-teal-300 transition-all"
              >
                <div className="p-6 space-y-4">
                  {article.featuredImage && (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={article.featuredImage}
                        alt={article.title}
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Article'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                      <Link href={`/blog/${article.slug}`} className="hover:text-teal-600">
                        {article.title.replace(/&nbsp;/g, ' ')}
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900"
                  >
                    Read Full Article &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Awareness Pillars Grid */}
      <section id="awareness" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 scroll-mt-24">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Why Diabetes Thrives in Status-Quo Neglect
          </h2>
          <p className="text-slate-600 text-lg">
            Relying on how you "feel" is a dangerous trap. High blood sugar is silent until major complications arise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {AWARENESS_PILLARS.map((pillar) => (
            <div
              key={pillar.id}
              className="bg-gradient-to-br from-blue-800 via-purple-900 to-pink-600 gradient-kit-panel text-white rounded-3xl p-8 shadow-xl border border-white/20 flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">{pillar.icon}</span>
                  <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30 backdrop-blur-md">
                    {pillar.stat}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{pillar.title}</h3>
                <p className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">{pillar.subtitle}</p>
                <p className="text-sm text-purple-100/90 leading-relaxed">{pillar.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Connecting Statement Divider & Campaign Anchor Target */}
      <section id="campaign" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-2 pb-0 scroll-mt-24">
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200/80 shadow-sm">
            Take Action Now
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        <p className="text-lg sm:text-2xl font-bold text-slate-800 leading-relaxed max-w-3xl mx-auto pt-1 pb-1">
          You cannot manage what you do not measure. <span className="text-indigo-700">High blood sugar operates in the dark</span>, but you don't have to. Stop guessing how your body feels and start knowing exactly where your health stands.
        </p>
      </section>

      {/* Campaign Call-to-Action Lead Capture */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 pb-2">
        <LeadMagnetCard
          title="Track Your Numbers. Prevent Complications."
        />
      </section>
    </div>
  );
}
