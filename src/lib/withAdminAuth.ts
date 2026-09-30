/**
 * withAdminAuth — DRY Higher-Order Function for admin route protection.
 *
 * Eliminates the isAdminAuthenticated() boilerplate that was copy-pasted
 * verbatim across every single admin API route handler.
 *
 * @example
 *   export const GET = withAdminAuth(async () => {
 *     const data = await AuthorityService.listAuthorities();
 *     return NextResponse.json({ success: true, data });
 *   });
 */
import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';

type RouteHandler = (req?: any, ctx?: any) => Promise<Response>;

export function withAdminAuth(handler: RouteHandler): (req?: any, ctx?: any) => Promise<Response> {
  return async (req?: any, ctx?: any) => {
    const isAuth = await isAdminAuthenticated(req);
    if (!isAuth) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    try {
      return await handler(req, ctx);
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  };
}
