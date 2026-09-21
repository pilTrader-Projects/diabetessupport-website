import { Metadata } from 'next';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { IPost } from '@/types/blog';
import LeadMagnetCard from '@/components/LeadMagnetCard';
import HeroSection from '@/components/home/HeroSection';
import CoreMetricsSection from '@/components/home/CoreMetricsSection';
import ManualAdvantageSection from '@/components/home/ManualAdvantageSection';
import RoadmapsSection from '@/components/home/RoadmapsSection';
import { SITE_CONFIG } from '@/config/constants';
import { buildSoftwareAppSchema } from '@/lib/schema';

export const revalidate = 60; // Refresh static page every 60 seconds

export const metadata: Metadata = {
  title: `GlycoSense | Free Manual Blood Sugar Tracking Dashboard for Filipino Providers`,
  description:
    'Turn simple, budget-friendly manual finger-prick logs and blood pressure checks into clear, actionable health trends that help you and your doctor safeguard your health.',
  keywords: [
    'GlycoSense',
    'blood sugar tracker philippines',
    'manual glucose log app',
    'free diabetes dashboard',
    'doctor ready health report',
    'filipino diabetes app',
  ],
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}/glycosense`,
  },
  openGraph: {
    title: 'GlycoSense | Zero-Cost Preventive Blood Sugar Dashboard',
    description:
      'Turn everyday finger-prick logs into actionable health trends to share with your physician. Free for family providers.',
    url: `https://${SITE_CONFIG.domain}/glycosense`,
    siteName: SITE_CONFIG.title,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GlycoSense — Preventive Blood Sugar Dashboard',
    description:
      'Turn everyday manual glucose tests into clear, doctor-ready trends without expensive continuous monitors.',
  },
};

/**
 * High-Awareness GlycoSense Tracker Pitch Page (/glycosense).
 *
 * @usecase Serves as the dedicated direct-response conversion route for users actively seeking diabetes tracking, manual logging advantages, and app onboarding.
 * @returns {Promise<JSX.Element>} Rendered GlycoSense product pitch page.
 */
export default async function GlycoSensePage(): Promise<React.JSX.Element> {
  const softwareSchema = buildSoftwareAppSchema();

  let rawPosts: any[] = [];
  try {
    await dbConnect();
    rawPosts = await PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean();
  } catch (err) {
    console.error('Error fetching posts for GlycoSensePage:', err);
  }

  const articles: IPost[] = rawPosts.map((doc: any) => ({
    ...doc,
    _id: doc._id ? doc._id.toString() : '',
    category: doc.category?.toString(),
    publishedAt: doc.publishedAt ? new Date(doc.publishedAt) : undefined,
  }));

  return (
    <div className="space-y-20 pb-8">
      {/* Schema.org SoftwareApplication JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />

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
