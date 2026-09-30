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

type RouteHandler = (req: Request, ctx?: any) => Promise<Response>;

export function withAdminAuth(handler: RouteHandler): RouteHandler {
  return async (req: Request, ctx?: any) => {
    const isAuth = await isAdminAuthenticated();
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
