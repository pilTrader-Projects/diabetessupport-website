import { NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/auth';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LearningService } from '@/services/learningService';

async function handleCronSync(req: Request) {
  // 1. Verify Authorization via Header (X-API-KEY / Bearer) or URL Search Param (?key=...)
  const url = new URL(req.url);
  const queryKey = url.searchParams.get('key');
  const secretKey = process.env.API_SECRET_KEY || 'sk_dev_diabetessupport_secret_key_change_in_production';
  const cronSecret = process.env.CRON_SECRET;

  const authHeader = req.headers.get('authorization');
  const isVercelCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  let isAuthorized = isVercelCron || (queryKey && queryKey === secretKey);

  if (!isAuthorized) {
    const apiAuth = await validateApiKey(req);
    if (apiAuth.valid) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    const adminAuth = await isAdminAuthenticated();
    if (adminAuth) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized: Missing or invalid API secret key or admin session.',
      },
      { status: 401 }
    );
  }

  // 2. Execute Periodic Syndication Engine
  try {
    const summary = await LearningService.runCronSyndication();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (err: any) {
    console.error('Cron Learning Syndication Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Cron syndication execution failed',
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return handleCronSync(req);
}

export async function POST(req: Request) {
  return handleCronSync(req);
}
