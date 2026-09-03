import { dbConnect } from './dbConnect';
import { ApiKeyModel } from '../models/ApiKey';

/**
 * Interface representing the result of an API key authentication check.
 * @usecase Strongly types authentication status and metadata.
 */
export interface AuthValidationResult {
  valid: boolean;
  keyName?: string;
  error?: string;
}

/**
 * Validates an incoming HTTP request's API key header against environment secrets and MongoDB ApiKey collection.
 *
 * @usecase Authenticates external automated content generators sending POST requests to publishing API endpoints.
 * @param {Request} req Incoming Web standard/Next.js Request object.
 * @dependencies dbConnect, ApiKeyModel, process.env.API_SECRET_KEY.
 * @returns {Promise<AuthValidationResult>} Promise resolving to validation status result.
 */
export async function validateApiKey(req: Request): Promise<AuthValidationResult> {
  const secretKey =
    process.env.API_SECRET_KEY || 'sk_dev_diabetessupport_secret_key_change_in_production';

  // 1. Check X-API-KEY header
  const xApiKey = req.headers.get('x-api-key') || req.headers.get('X-API-KEY');

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  let bearerToken: string | null = null;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    bearerToken = authHeader.substring(7).trim();
  }

  const tokenToValidate = xApiKey || bearerToken;

  if (!tokenToValidate) {
    return {
      valid: false,
      error: 'Unauthorized: Missing API key in X-API-KEY or Authorization header.',
    };
  }

  // 3. Match static secret key
  if (tokenToValidate === secretKey) {
    return {
      valid: true,
      keyName: 'System Primary Master Key',
    };
  }

  // 4. Query DB for active ApiKey document
  try {
    await dbConnect();
    const apiKeyDoc = await ApiKeyModel.findOne({ key: tokenToValidate, active: true });
    if (apiKeyDoc) {
      return {
        valid: true,
        keyName: apiKeyDoc.name,
      };
    }
  } catch (err: any) {
    console.error('Error verifying API Key against MongoDB:', err);
  }

  return {
    valid: false,
    error: 'Unauthorized: Invalid or revoked API authentication key.',
  };
}

/**
 * Transforms a human-readable title string into a clean, URL-friendly slug.
 *
 * @usecase Generates URL slugs for new articles automatically if explicit slug is not supplied.
 * @param {string} text Raw string text to slugify.
 * @returns {string} URL-safe kebab-case slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9 -]/g, '') // remove non-alphanumeric chars
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/-+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start
    .replace(/-+$/, ''); // trim - from end
}
