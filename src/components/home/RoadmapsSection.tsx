'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { IPost } from '@/types/blog';
import MealPlanModal from './MealPlanModal';

interface RoadmapsSectionProps {
  articles: IPost[];
}

/**
 * Roadmaps & Educational Articles Section.
 *
 * @usecase Presents self-guided recovery pathways for insulin resistance and early Type 2 management with an interactive lead magnet modal and dynamic MongoDB blog posts.
 * @param {RoadmapsSectionProps} props Component props containing fetched article array.
 * @dependencies Next.js Link, IPost interface, MealPlanModal, Tailwind CSS styling.
 * @returns {JSX.Element} Rendered Roadmaps and Blog Articles Section.
 */
export default function RoadmapsSection({ articles }: RoadmapsSectionProps): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section
      id="education"
      className="min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 scroll-mt-16 py-8 sm:py-12"
    >
      {/* Self-Guided Recovery Roadmaps */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            🚦 Actionable Turn-Around
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Choose Your Path: It is Not Too Late to Turn Around
          </h2>
          <p className="text-slate-600 text-base">
            Identify where your metabolism currently stands and take the precise steps to reverse or halt progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Path 1: Insulin Resistance */}
          <div className="bg-gradient-to-br from-teal-900 to-slate-900 text-white p-8 rounded-3xl border border-teal-700/50 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-teal-300 bg-teal-800/60 px-3 py-1 rounded-full border border-teal-600/40">
                  STAGE 1: PRE-DIABETES &amp; RESISTANCE
                </span>
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-bold text-white">If You Are Insulin Resistant</h3>
              <p className="text-sm text-teal-100/90 leading-relaxed">
                Your cells have stopped listening to insulin, but your pancreas is still fighting. You can be awakened to what you are facing and turn around by keeping close watch over your eating habits. No injections required.
              </p>
            </div>
            <Link
              href="/blog/reverse-insulin-resistance-naturally"
              className="inline-flex items-center justify-between w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-5 py-3.5 rounded-xl transition-all shadow-md text-sm group"
            >
              <span>Read: How to Reverse Insulin Resistance Naturally</span>
              <span className="group-hover:translate-x-1 transition-transform">➔</span>
            </Link>
          </div>

          {/* Path 2: Early Type 2 Diabetes with Lead Magnet Modal */}
          <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-indigo-700/50 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 bg-indigo-800/60 px-3 py-1 rounded-full border border-indigo-600/40">
                  STAGE 2: EARLY TYPE 2 REMISSION
                </span>
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-white">If You Are in Early Type 2 Diabetes</h3>
              <p className="text-sm text-indigo-100/90 leading-relaxed">
                If you are in early Type 2 diabetes—clinical research shows that many individuals can achieve metabolic remission and avoid severe complications through disciplined carbohydrate management and lifestyle interventions under medical supervision.
              </p>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-between w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-300 hover:to-orange-300 text-slate-950 font-black px-5 py-3.5 rounded-xl transition-all shadow-md text-sm group cursor-pointer"
              >
                <span>Get Free Filipino Meal Plan &amp; Guide</span>
                <span className="group-hover:translate-x-1 transition-transform">➔</span>
              </button>
              <div className="text-center">
                <Link
                  href="/blog/top-10-filipino-foods-for-managing-diabetes-with-a-free-meal-plan"
                  className="text-xs text-indigo-300 hover:text-white transition-colors underline decoration-indigo-500"
                >
                  or read full article online &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic MongoDB Articles Feed */}
      <div className="space-y-8 pt-6 border-t border-slate-200">
        <div id="articles" className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Educational Library</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Latest Health Guides &amp; Research
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
            <p className="text-slate-500">Explore our comprehensive library of diabetes research and nutrition guides.</p>
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
      </div>

      {/* Pop-up Lead Magnet Modal */}
      <MealPlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
}
