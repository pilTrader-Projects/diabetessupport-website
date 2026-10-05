import { permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/config/constants';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: {
      canonical: `/community/${slug}`,
    },
    openGraph: {
      url: `https://${SITE_CONFIG.domain}/community/${slug}`,
    },
  };
}

/**
 * Legacy Blog Post Redirect Component.
 *
 * @usecase Permanently redirects legacy /learn/[slug] URLs to their migrated location in /community/[slug].
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/community/${slug}`);
}
