import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LearningService } from '@/services/learningService';

export async function POST(req: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body is fine
    }

    if (body.authorityId) {
      const res = await LearningService.syncAuthorityYouTubeFeed(body.authorityId);
      return NextResponse.json({ success: true, data: res });
    }

    const res = await LearningService.syncAllActiveAuthorities();
    return NextResponse.json({ success: true, data: res });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
