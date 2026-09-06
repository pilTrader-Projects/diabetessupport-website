import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/dbConnect';
import Thread from '@/models/Thread';
import Reply from '@/models/Reply';
import ThreadViewClient from '@/components/community/ThreadViewClient';
import { buildDiscussionForumPostingSchema, buildBreadcrumbSchema } from '@/lib/schema';
import { SITE_CONFIG } from '@/config/constants';

interface ThreadPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();
  const thread = await Thread.findOne({ slug }).lean();

  if (!thread || thread.status === 'archived') {
    return {
      title: `Discussion Not Found | DiabetesCare PH`,
      description: 'The requested community discussion could not be found.',
    };
  }

  const isQuarantined = thread.status === 'flagged' || (thread.reportCount && thread.reportCount >= 2);
  const threadUrl = `https://${SITE_CONFIG.domain}/community/${thread.slug}`;

  return {
    title: `${thread.title} | DiabetesCare PH Community`,
    description: thread.content.slice(0, 155),
    alternates: {
      canonical: threadUrl,
    },
    robots: isQuarantined ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: thread.title,
      description: thread.content.slice(0, 155),
      url: threadUrl,
      siteName: 'DiabetesCare PH Community',
      type: 'article',
    },
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { slug } = await params;
  await dbConnect();

  const threadDoc = await Thread.findOne({ slug });
  if (!threadDoc || threadDoc.status === 'archived') {
    notFound();
  }

  // Increment view count asynchronously
  Thread.updateOne({ _id: threadDoc._id }, { $inc: { views: 1 } }).exec();

  const repliesDocs = await Reply.find({
    threadId: threadDoc._id,
    status: { $ne: 'archived' },
  })
    .sort({ createdAt: 1 })
    .lean();

  const plainThread = {
    _id: threadDoc._id.toString(),
    title: threadDoc.title,
    slug: threadDoc.slug,
    content: threadDoc.content,
    category: threadDoc.category,
    authorAlias: threadDoc.authorAlias,
    authorTag: threadDoc.authorTag,
    authorId: threadDoc.authorId,
    status: threadDoc.status,
    reportCount: threadDoc.reportCount || 0,
    views: (threadDoc.views || 0) + 1,
    repliesCount: repliesDocs.length,
    createdAt: threadDoc.createdAt,
    updatedAt: threadDoc.updatedAt,
  };

  const plainReplies = repliesDocs.map((r: any) => ({
    _id: r._id.toString(),
    threadId: r.threadId.toString(),
    content: r.content,
    authorAlias: r.authorAlias,
    authorTag: r.authorTag,
    authorId: r.authorId,
    isOp: r.isOp || false,
    status: r.status,
    reportCount: r.reportCount || 0,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));

  const forumSchema = buildDiscussionForumPostingSchema(plainThread, plainReplies);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: `https://${SITE_CONFIG.domain}` },
    { name: 'Community', url: `https://${SITE_CONFIG.domain}/community` },
    { name: plainThread.category, url: `https://${SITE_CONFIG.domain}/community?category=${encodeURIComponent(plainThread.category)}` },
    { name: plainThread.title, url: `https://${SITE_CONFIG.domain}/community/${plainThread.slug}` },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(forumSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ThreadViewClient thread={plainThread as any} initialReplies={plainReplies as any} />

      {/* Peer Support Disclaimer */}
      <div className="max-w-4xl mx-auto mt-12 text-center text-xs text-slate-400 border-t border-slate-200 pt-6">
        <p>
          Medical Disclaimer: DiabetesCare PH Community is a peer-to-peer experiential discussion board.
          Information shared here is for mutual emotional support and lifestyle sharing only, and must never replace direct consultation with licensed medical doctors or endocrinologists.
        </p>
      </div>
    </div>
  );
}
