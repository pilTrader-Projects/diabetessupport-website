import { cookies } from 'next/headers';
import { validateApiKey } from './auth';

export const ADMIN_COOKIE_NAME = 'admin_session';

/**
 * Validates whether the incoming request has admin privileges via Cookie or Authorization header.
 *
 * @usecase Secures /admin API endpoints and dashboard routes.
 * @param {Request} req Incoming HTTP Request.
 * @returns {Promise<boolean>} True if user is authenticated as owner/admin.
 */
export async function isAdminAuthenticated(req?: Request): Promise<boolean> {
  // 1. Check API Key or Bearer Token header if request passed
  if (req) {
    const authRes = await validateApiKey(req);
    if (authRes.valid) {
      return true;
    }
  }

  // 2. Check HttpOnly Session Cookie
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const secretKey = process.env.API_SECRET_KEY || 'dev_secret_key_123';

    if (sessionToken && sessionToken === secretKey) {
      return true;
    }
  } catch (err) {
    console.error('Error reading admin session cookie:', err);
  }

  return false;
}
