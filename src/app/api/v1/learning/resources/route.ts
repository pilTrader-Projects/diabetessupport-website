import { NextResponse } from 'next/server';
import { LearningService } from '@/services/learningService';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const topic = searchParams.get('topic') || undefined;
    const authorityId = searchParams.get('authorityId') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 60;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : 0;

    const data = await LearningService.listResources({
      status: 'published',
      type,
      topic,
      authorityId,
      search,
      limit,
      skip,
    });

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
