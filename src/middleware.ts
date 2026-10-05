import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveUserRegion } from '@/lib/localizationResolver';

export const USER_REGION_COOKIE = 'bn_user_region';

/**
 * Edge Middleware localization resolver for Before the Numbers.
 *
 * @usecase Detects visitor country location when visiting root ('/').
 * If the user is in the Philippines (or an explicitly supported regional chapter),
 * automatically redirects them to '/ph' by default.
 * All other countries are served the global master brand at '/'.
 * Honors explicit user preference overrides (e.g. ?edition=global or cookie).
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // 0. Domain Canonicalization: Enforce apex host (redirect www to apex with 301)
  const host = request.headers.get('host') || '';
  if (host.startsWith('www.')) {
    const apexHost = host.replace(/^www\./i, '');
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.host = apexHost;
    if (!host.includes('localhost')) {
      redirectUrl.protocol = 'https:';
    }
    return NextResponse.redirect(redirectUrl, { status: 301 });
  }

  // 1. Resolve localization for root landing requests ('/')
  if (pathname === '/') {
    const queryEdition = searchParams.get('edition') || searchParams.get('region');
    const cookieRegion = request.cookies.get(USER_REGION_COOKIE)?.value;

    const countryHeader =
      request.headers.get('x-vercel-ip-country') || request.headers.get('x-country-code');
    const cfCountry = request.headers.get('cf-ipcountry');
    const geoCountry = (request as any).geo?.country;
    const acceptLanguage = request.headers.get('accept-language');

    const resolution = resolveUserRegion({
      countryHeader,
      cfCountry,
      geoCountry,
      acceptLanguage,
      cookieRegion,
      queryEdition,
    });

    // If region resolves to a specific country route and needs redirection
    if (resolution.shouldRedirect && resolution.targetPath && resolution.targetPath !== '/') {
      const redirectUrl = new URL(resolution.targetPath, request.url);
      const response = NextResponse.redirect(redirectUrl);

      if (resolution.detectedRegion) {
        response.cookies.set(USER_REGION_COOKIE, resolution.detectedRegion.toLowerCase(), {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          sameSite: 'lax',
        });
      }
      return response;
    }

    // If user explicitly requests global view, remember their choice
    if (queryEdition === 'global') {
      const response = NextResponse.next();
      response.cookies.set(USER_REGION_COOKIE, 'global', {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      });
      return response;
    }
  }

  // 2. If visitor directly navigates to /ph, remember preferred region
  if (pathname === '/ph') {
    const response = NextResponse.next();
    response.cookies.set(USER_REGION_COOKIE, 'ph', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/ph'],
};
