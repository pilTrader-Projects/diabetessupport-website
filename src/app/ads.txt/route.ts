import { NextResponse } from 'next/server';
import { ADSENSE_CONFIG } from '@/config/constants';

/**
 * Dynamic Authorized Digital Sellers (ads.txt) Route Handler.
 *
 * @usecase Serves publisher verification records for Google AdSense crawlers to prevent ad inventory fraud.
 * @dependencies ADSENSE_CONFIG constant.
 * @returns {NextResponse} Plain text response with standard ads.txt formatting.
 */
export async function GET(): Promise<NextResponse> {
  const publisherId = ADSENSE_CONFIG.publisherId.replace(/^ca-/, '');
  const adsTxtContent = `# Authorized Digital Sellers for DiabetesCare PH\ngoogle.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`;

  return new NextResponse(adsTxtContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
    },
  });
}
