import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/constants';
import KitOptInForm from '@/components/KitOptInForm';
import BlogPostContent from '@/components/BlogPostContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let post: any = null;
  try {
    await dbConnect();
    post = await PostModel.findOne({ slug, status: 'published' }).lean();
  } catch (err) {
    console.error('Error fetching metadata for blog post:', err);
  }

  if (!post) {
    return { title: 'Article Not Found | DiabetesCare PH' };
  }

  const title = (post.title || '').replace(/&nbsp;/g, ' ');
  const description = post.excerpt || post.metaDescription || 'Educational guide on diabetes care.';
  const pageUrl = `https://${SITE_CONFIG.domain}/blog/${slug}`;

  return {
    title: `${title} | DiabetesCare PH`,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: SITE_CONFIG.title,
      type: 'article',
      publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
      modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
      authors: [SITE_CONFIG.author],
      images: post.featuredImage ? [{ url: post.featuredImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

/**
 * Individual Blog Post Article Reader Page Component.
 *
 * @usecase Renders full HTML content of an imported blog post document retrieved by unique slug.
 * @param {PageProps} props Route parameters containing slug.
 * @dependencies dbConnect, PostModel, notFound helper.
 * @returns {Promise<JSX.Element>} Rendered article view page.
 */
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post: any = null;
  try {
    await dbConnect();
    post = await PostModel.findOne({ slug, status: 'published' }).lean();
  } catch (err) {
    console.error('Error fetching blog post page:', err);
  }
  if (!post) {
    notFound();
  }

  const cleanTitle = (post.title || '').replace(/&nbsp;/g, ' ');
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-teal-600">Articles</Link>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{cleanTitle}</span>
      </div>

      {/* Article Header */}
      <header className="space-y-4 text-center sm:text-left">
        <span className="inline-block bg-teal-100 text-teal-900 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-teal-200">
          Diabetes Awareness Guide
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {cleanTitle}
        </h1>
        {formattedDate && (
          <p className="text-sm font-semibold text-slate-500">
            Published on <time dateTime={post.publishedAt.toString()}>{formattedDate}</time> • DiabetesCare PH Team
          </p>
        )}
      </header>

      {/* Featured Banner Image */}
      {post.featuredImage && (
        <div className="aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.featuredImage}
            alt={cleanTitle}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      {/* Article Body Content */}
      <BlogPostContent content={post.content} slug={slug} />

      {/* Lead Capture Opt-In Form */}
      <div className="pt-8">
        <KitOptInForm
          title="Enjoyed this article? Get our free weekly health guides"
          subtitle="Join over 15,000+ readers receiving low-GI recipes, blood sugar management tips, and free downloadable cheat sheets."
          buttonText="Subscribe Free"
          layout="inline"
          source={`article_${slug}`}
        />
      </div>

      {/* Footer Navigation */}
      <div className="pt-8 border-t border-slate-200 flex justify-between items-center">
        <Link
          href="/blog"
          className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors"
        >
          &larr; Back to All Articles
        </Link>
      </div>
    </article>
  );
}
