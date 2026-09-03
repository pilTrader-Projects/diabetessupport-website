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
  const targetUrl = landingPage.kitScriptUrl || '';
  const isHostedLandingPage =
    landingPage.embedType === 'iframe' ||
    landingPage.embedType === 'hosted' ||
    targetUrl.includes('.ck.page') ||
    (targetUrl.includes('.kit.com') && !targetUrl.endsWith('.js'));

  if (isHostedLandingPage) {
    return (
      <div className="min-h-screen bg-slate-950 py-6 px-2 sm:px-6 flex flex-col justify-between">
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center">
          <KitScriptEmbed
            scriptUrl={landingPage.kitScriptUrl}
            formId={landingPage.kitFormId}
            title={landingPage.title}
            embedType="hosted"
          />
        </div>
        <div className="text-center py-4">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-teal-400 transition-colors">
            &larr; Back to DiabetesCare PH Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full border border-teal-200 inline-block">
          ✨ Special Resource & Lead Capture
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {landingPage.title}
        </h1>
        {landingPage.description && (
          <p className="text-lg text-slate-600 leading-relaxed">
            {landingPage.description}
          </p>
        )}
      </div>

      {/* Embedded Kit Form / Script */}
      {hasKitEmbed ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl">
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

      {/* Back Link */}
      <div className="text-center pt-8 border-t border-slate-200">
        <Link href="/" className="text-sm font-bold text-teal-700 hover:text-teal-900">
          &larr; Back to Homepage
        </Link>
      </div>
    </div>
  );
}
