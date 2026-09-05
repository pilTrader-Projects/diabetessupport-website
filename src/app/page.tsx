import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { IPost } from '@/types/blog';
import LeadMagnetCard from '@/components/LeadMagnetCard';
import HeroSection from '@/components/home/HeroSection';
import CoreMetricsSection from '@/components/home/CoreMetricsSection';
import ManualAdvantageSection from '@/components/home/ManualAdvantageSection';
import RoadmapsSection from '@/components/home/RoadmapsSection';

export const revalidate = 60; // Refresh static page every 60 seconds

/**
 * Diabetes Awareness & Educational Campaign Home Page Component.
 *
 * @usecase Presents high-converting 'Breadwinner Pivot' messaging, vital target metrics, cost-efficient manual tracking advantages, and self-guided health roadmaps.
 * @param None Page component receives no props.
 * @dependencies dbConnect, PostModel, HeroSection, CoreMetricsSection, ManualAdvantageSection, RoadmapsSection, LeadMagnetCard.
 * @returns {Promise<JSX.Element>} Rendered awareness landing page with modular sub-components.
 */
export default async function HomePage(): Promise<JSX.Element> {
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
      {/* 1. Hero Section: The Breadwinner's Responsibility & Threat */}
      <HeroSection />

      {/* 2. Core Metrics: Accurate Numbers (HbA1c, Fasting, Post-Meal) + Urinalysis & BP */}
      <CoreMetricsSection />

      {/* 3. The App Value: Cost-Efficient Manual Tracking vs. Costly CGMs */}
      <ManualAdvantageSection />

      {/* 4. The Roadmaps: Self-Guided Articles based on Medical Stage */}
      <RoadmapsSection articles={articles} />

      {/* 5. Final CTA: Free Registration & Protection */}
      <section
        id="campaign"
        className="min-h-[calc(100vh-4rem)] min-h-[calc(100dvh-4rem)] flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center scroll-mt-16 py-8 sm:py-12 space-y-6"
      >
        <div className="relative flex items-center max-w-3xl mx-auto w-full">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-4 text-xs font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-50 px-3.5 py-1 rounded-full border border-indigo-200/80 shadow-sm">
            Protect Your Household
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>
        <p className="text-base sm:text-xl font-bold text-slate-800 leading-relaxed max-w-3xl mx-auto">
          You cannot manage what you do not measure. <span className="text-indigo-700">A simple test today</span> prevents a financial and medical catastrophe for your family tomorrow.
        </p>

        <LeadMagnetCard
          title="Secure Your Health. Protect Your Family's Future."
          subtitle="Turn everyday manual finger-prick logs and blood pressure checks into clear, organized health trends to share with your physician."
        />
      </section>
    </div>
  );
}
