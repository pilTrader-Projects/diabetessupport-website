import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LearningService } from '@/services/learningService';

export async function GET() {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const channels = await LearningService.listPodcastChannels();
    return NextResponse.json({ success: true, data: channels });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Show name is required' }, { status: 400 });
    }
    const created = await LearningService.createPodcastChannel(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
