import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/config/constants';

/**
 * Native Next.js App Router robots.txt Generator.
 *
 * @usecase Declares bot crawling policies, protects admin and API endpoints, and advertises the XML sitemap location.
 * @dependencies SITE_CONFIG.domain constant.
 * @returns {MetadataRoute.Robots} Compliant Next.js robots configuration.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = `https://${SITE_CONFIG.domain}`;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/admin/*',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
