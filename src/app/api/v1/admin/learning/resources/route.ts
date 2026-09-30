import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';

export const GET = withAdminAuth(async (req) => {
  const { searchParams } = new URL(req.url);
  const data = await LearningService.listResources({
    type: searchParams.get('type') || undefined,
    topic: searchParams.get('topic') || undefined,
    authorityId: searchParams.get('authorityId') || undefined,
    status: searchParams.get('status') || undefined,
    search: searchParams.get('search') || undefined,
    limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50,
    skip: searchParams.get('skip') ? parseInt(searchParams.get('skip')!, 10) : 0,
  });
  return NextResponse.json({ success: true, data });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  if (!body.title || !body.type || !body.sourceUrl || !body.authorityName) {
    return NextResponse.json(
      { success: false, error: 'Title, type, sourceUrl, and authorityName are required' },
      { status: 400 }
    );
  }
  if (body.sourceUrl.includes('youtube.com') || body.sourceUrl.includes('youtu.be')) {
    body.platform = 'youtube';
    const match = body.sourceUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([\w-]{11})/);
    if (match) {
      body.embedId = match[1];
      if (!body.thumbnailUrl) body.thumbnailUrl = `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`;
    }
  }
  const created = await LearningService.createResource(body);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
});
