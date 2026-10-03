import { NextRequest } from 'next/server';
import { middleware, USER_REGION_COOKIE } from '../../src/middleware';

describe('Edge Localization Middleware', () => {
  it('redirects to /ph when visiting / from Philippines (x-vercel-ip-country)', () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: {
        'x-vercel-ip-country': 'PH',
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/ph');
    expect(res.cookies.get(USER_REGION_COOKIE)?.value).toBe('ph');
  });

  it('redirects to /ph when visiting / from Philippines (cf-ipcountry)', () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: {
        'cf-ipcountry': 'ph',
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/ph');
  });

  it('allows access to root / without redirect when visiting from US or other country', () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: {
        'x-vercel-ip-country': 'US',
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('does NOT redirect when user in PH explicitly visits /?edition=global', () => {
    const req = new NextRequest('http://localhost:3000/?edition=global', {
      headers: {
        'x-vercel-ip-country': 'PH',
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
    expect(res.cookies.get(USER_REGION_COOKIE)?.value).toBe('global');
  });

  it('does NOT redirect when user has bn_user_region=global cookie', () => {
    const req = new NextRequest('http://localhost:3000/', {
      headers: {
        'x-vercel-ip-country': 'PH',
        cookie: `${USER_REGION_COOKIE}=global`,
      },
    });

    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('sets bn_user_region=ph cookie when directly visiting /ph', () => {
    const req = new NextRequest('http://localhost:3000/ph');
    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.cookies.get(USER_REGION_COOKIE)?.value).toBe('ph');
  });
});
