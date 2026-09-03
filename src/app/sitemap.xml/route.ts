import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { SITE_CONFIG } from '@/config/constants';

/**
 * Escapes special XML characters to prevent XML parsing errors.
 *
 * @usecase Sanitizes strings placed inside XML tags.
 * @param {string} str Input string.
 * @returns {string} Sanitized XML-safe string.
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Dynamic XML Sitemap Route Handler.
 *
 * @usecase Generates search engine compliant XML sitemap dynamically from active database articles.
 * @dependencies dbConnect, PostModel, SITE_CONFIG.
 * @returns {Promise<NextResponse>} XML Response containing sitemap urlset entries.
 */
export async function GET(): Promise<NextResponse> {
  const baseUrl = `https://${SITE_CONFIG.domain}`;

  let posts: any[] = [];
  try {
    await dbConnect();
    posts = await PostModel.find({ status: 'published' })
      .sort({ updatedAt: -1 })
      .lean();
  } catch (err) {
    console.error('Error retrieving posts for sitemap.xml:', err);
  }

  const staticRoutes = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString() },
    { url: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily', lastmod: new Date().toISOString() },
  ];

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : new Date().toISOString(),
  }));

  const allRoutes = [...staticRoutes, ...postRoutes];

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(route.url)}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xmlContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
