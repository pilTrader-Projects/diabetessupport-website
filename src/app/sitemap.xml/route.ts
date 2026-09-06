import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { LandingPageModel } from '@/models/LandingPage';
import { Thread } from '@/models/Thread';
import { SITE_CONFIG } from '@/config/constants';

/**
 * Escapes special XML characters to prevent XML parsing errors.
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
 * @usecase Generates search engine compliant XML sitemap dynamically from active database articles, landing pages, community threads, and static routes.
 */
export async function GET(): Promise<NextResponse> {
  const baseUrl = `https://${SITE_CONFIG.domain}`;
  const now = new Date().toISOString();

  let posts: any[] = [];
  let landingPages: any[] = [];
  let threads: any[] = [];

  try {
    await dbConnect();
    [posts, landingPages, threads] = await Promise.all([
      PostModel.find({ status: 'published' }).sort({ updatedAt: -1 }).lean(),
      LandingPageModel.find({ isActive: true }).sort({ updatedAt: -1 }).lean(),
      Thread.find({ status: 'published', reportCount: { $lt: 2 } }).sort({ updatedAt: -1 }).lean(),
    ]);
  } catch (err) {
    console.error('Error retrieving documents for sitemap.xml:', err);
  }

  const staticRoutes = [
    { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily', lastmod: now },
    { url: `${baseUrl}/blog`, priority: '0.9', changefreq: 'daily', lastmod: now },
    { url: `${baseUrl}/community`, priority: '0.85', changefreq: 'daily', lastmod: now },
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

  const threadRoutes = threads.map((th) => ({
    url: `${baseUrl}/community/${th.slug}`,
    priority: '0.8',
    changefreq: 'daily',
    lastmod: th.updatedAt ? new Date(th.updatedAt).toISOString() : now,
  }));

  const allRoutes = [...staticRoutes, ...postRoutes, ...landingPageRoutes, ...threadRoutes];

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
