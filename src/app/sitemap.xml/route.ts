import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { LandingPageModel } from '@/models/LandingPage';
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
 * @usecase Generates search engine compliant XML sitemap dynamically from active database articles, landing pages, and static routes.
 * @dependencies dbConnect, PostModel, LandingPageModel, SITE_CONFIG.
 * @returns {Promise<NextResponse>} XML Response containing sitemap urlset entries.
 */
export async function GET(): Promise<NextResponse> {
  const baseUrl = `https://${SITE_CONFIG.domain}`;
  const now = new Date().toISOString();

  let posts: any[] = [];
  let landingPages: any[] = [];

  try {
    await dbConnect();
    [posts, landingPages] = await Promise.all([
      PostModel.find({ status: 'published' }).sort({ updatedAt: -1 }).lean(),
      LandingPageModel.find({ isActive: true }).sort({ updatedAt: -1 }).lean(),
    ]);
  } catch (err) {
    console.error('Error retrieving documents for sitemap.xml:', err);
  }

  const staticRoutes = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: now },
    { url: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily', lastmod: now },
    { url: `${baseUrl}/guides/cheatsheet`, priority: '0.85', changefreq: 'weekly', lastmod: now },
    { url: `${baseUrl}/subscribe`, priority: '0.7', changefreq: 'monthly', lastmod: now },
    { url: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly', lastmod: now },
    { url: `${baseUrl}/contact`, priority: '0.7', changefreq: 'monthly', lastmod: now },
    { url: `${baseUrl}/privacy-policy`, priority: '0.5', changefreq: 'monthly', lastmod: now },
    { url: `${baseUrl}/terms-of-service`, priority: '0.5', changefreq: 'monthly', lastmod: now },
  ];

  const postRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: post.updatedAt ? new Date(post.updatedAt).toISOString() : now,
  }));

  const landingPageRoutes = landingPages.map((lp) => ({
    url: `${baseUrl}/${lp.slug}`,
    priority: '0.75',
    changefreq: 'weekly',
    lastmod: lp.updatedAt ? new Date(lp.updatedAt).toISOString() : now,
  }));

  const allRoutes = [...staticRoutes, ...postRoutes, ...landingPageRoutes];

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
