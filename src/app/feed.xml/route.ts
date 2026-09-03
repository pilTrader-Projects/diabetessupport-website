import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { SITE_CONFIG } from '@/config/constants';

/**
 * Escapes special XML characters to ensure valid RSS 2.0 markup.
 *
 * @usecase Sanitizes titles, descriptions, and URLs inside RSS items.
 * @param {string} str Raw text string.
 * @returns {string} Sanitized XML string.
 */
function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Dynamic RSS 2.0 XML Feed Route Handler.
 *
 * @usecase Exposes site articles to RSS readers and syndication services.
 * @dependencies dbConnect, PostModel, SITE_CONFIG.
 * @returns {Promise<NextResponse>} XML Response containing RSS 2.0 channel feed.
 */
export async function GET(): Promise<NextResponse> {
  const baseUrl = `https://${SITE_CONFIG.domain}`;

  let posts: any[] = [];
  try {
    await dbConnect();
    posts = await PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(30)
      .lean();
  } catch (err) {
    console.error('Error generating RSS feed:', err);
  }

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/blog/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();
      const cleanTitle = (post.title || '').replace(/&nbsp;/g, ' ');
      const cleanExcerpt = (post.excerpt || '').replace(/&nbsp;/g, ' ');

      return `    <item>
      <title>${escapeXml(cleanTitle)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="true">${escapeXml(postUrl)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(cleanExcerpt)}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_CONFIG.title)}</title>
    <link>${baseUrl}/blog</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
