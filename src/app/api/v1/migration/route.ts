import { NextResponse } from 'next/server';
import { executeWordPressMigration } from '../../../../../scripts/migrate-wordpress';

/**
 * HTTP POST API Route handler for executing the WordPress content migration job.
 *
 * @usecase Triggers WordPress legacy data import via HTTP request (protected by Bearer API_SECRET_KEY).
 * @param {Request} req Next.js incoming HTTP request object containing Authorization header.
 * @dependencies executeWordPressMigration service, process.env.API_SECRET_KEY.
 * @returns {Promise<NextResponse>} JSON response containing execution migration metrics or error status.
 * @throws {Error} Returns 401 Unauthorized if authorization header is invalid.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const authHeader = req.headers.get('authorization');
  const secretKey = process.env.API_SECRET_KEY || 'sk_dev_diabetessupport_secret_key_change_in_production';

  if (!authHeader || authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Invalid or missing API authorization token.' },
      { status: 401 }
    );
  }

  try {
    const summary = await executeWordPressMigration();
    return NextResponse.json({
      success: true,
      message: 'WordPress migration job executed successfully.',
      data: summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Migration Error' },
      { status: 500 }
    );
  }
}
