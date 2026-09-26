import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LearningService } from '@/services/learningService';

export async function GET(req: Request) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const authorityId = searchParams.get('authorityId') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : 0;

    const data = await LearningService.listResources({
      type,
      topic,
      authorityId,
      status,
      search,
      limit,
      skip,
    });

    return NextResponse.json({ success: true, data });
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
    if (!body.title || !body.type || !body.sourceUrl || !body.authorityName) {
      return NextResponse.json(
        { success: false, error: 'Title, type, sourceUrl, and authorityName are required' },
        { status: 400 }
      );
    }

    // Auto-detect YouTube embed ID if youtube URL
    if (body.sourceUrl.includes('youtube.com') || body.sourceUrl.includes('youtu.be')) {
      body.platform = 'youtube';
      const match = body.sourceUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
      if (match) {
        body.embedId = match[1];
        if (!body.thumbnailUrl) {
          body.thumbnailUrl = `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
        }
      }
    }

    const created = await LearningService.createResource(body);
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
