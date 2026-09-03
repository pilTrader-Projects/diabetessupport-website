import { dbConnect } from '@/lib/dbConnect';
import { LandingPageModel } from '@/models/LandingPage';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import KitScriptEmbed from '@/components/KitScriptEmbed';
import KitOptInForm from '@/components/KitOptInForm';
import { SITE_CONFIG } from '@/config/constants';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Dynamic Metadata Generator for Owner-Managed Landing Pages.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();

  const landingPage: any = await LandingPageModel.findOne({ slug, isActive: true }).lean();
  if (!landingPage) {
    return { title: 'Page Not Found | DiabetesCare PH' };
  }

  const title = landingPage.metaTitle || landingPage.title;
  const description = landingPage.metaDescription || landingPage.description || SITE_CONFIG.description;
  const pageUrl = `https://${SITE_CONFIG.domain}/${slug}`;

  return {
    title: `${title} | ${SITE_CONFIG.title}`,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_CONFIG.title,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Dynamic Catch-All Route Handler for Owner-Configured Kit Landing Pages.
 *
 * @usecase Renders custom slugs (e.g. /subscribe, /free-guide) managed visually by owner in /admin.
 * @param {PageProps} props Route parameters containing slug.
 * @dependencies dbConnect, LandingPageModel, KitScriptEmbed component.
 * @returns {Promise<JSX.Element>} Rendered owner landing page.
 */
export default async function DynamicSlugPage({ params }: PageProps) {
  const { slug } = await params;
  await dbConnect();

  const landingPage: any = await LandingPageModel.findOne({ slug, isActive: true }).lean();

  if (!landingPage) {
    notFound();
  }

  const hasKitEmbed = Boolean(landingPage.kitScriptUrl || landingPage.kitFormId);

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Page Title & Subtitle Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
   
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-medium">
            {landingPage.description}
          </p>
        )}
      </div>

      {/* Container Element Wrapping Embedded Kit Landing Page / Form */}
      <div className="max-w-5xl mx-auto">
        {hasKitEmbed ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-3 sm:p-6 overflow-hidden">
            <KitScriptEmbed
              scriptUrl={landingPage.kitScriptUrl}
              formId={landingPage.kitFormId}
              title={landingPage.title}
              embedType={landingPage.embedType}
            />
          </div>
        ) : (
          <div className="max-w-xl mx-auto">
            <KitOptInForm
              title={landingPage.title}
              subtitle={landingPage.description || 'Subscribe now for instant access to our guides.'}
              buttonText="Get Instant Access"
              layout="card"
              source={`slug_${slug}`}
            />
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="text-center pt-6 border-t border-slate-200 max-w-3xl mx-auto">
        <Link href="/" className="text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors">
          &larr; Back to DiabetesCare PH Homepage
        </Link>
      </div>
    </div>
  );
}
