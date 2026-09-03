import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/adminAuth';

/**
 * Owner Admin Login API Route Handler.
 *
 * @usecase Authenticates the site owner using secret key or admin credentials and sets session cookie.
 * @param {Request} req HTTP Request with JSON body { secretKey: string }.
 * @returns {Promise<NextResponse>} JSON response with login result and Set-Cookie header.
 */
export async function POST(req: Request): Promise<NextResponse> {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const { secretKey } = body || {};
  const validSecret = process.env.API_SECRET_KEY || 'dev_secret_key_123';

  if (!secretKey || secretKey !== validSecret) {
    return NextResponse.json(
      { success: false, error: 'Invalid admin credentials.' },
      { status: 401 }
    );
  }

  // Set HttpOnly Admin Session Cookie
  const response = NextResponse.json({
    success: true,
    message: 'Login successful. Session established.',
  });

  try {
    const cookieStore = await cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, validSecret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (err) {
    console.error('Error setting admin session cookie:', err);
  }

  return response;
}

/**
 * Owner Admin Logout API Route Handler.
 *
 * @usecase Clears the admin session cookie.
 * @returns {Promise<NextResponse>} JSON response clearing admin_session cookie.
 */
export async function DELETE(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(ADMIN_COOKIE_NAME);
  } catch (err) {
    console.error('Error clearing cookie:', err);
  }

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
  });
}
