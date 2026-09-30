import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';

export const GET = withAdminAuth(async () => {
  const channels = await LearningService.listPodcastChannels();
  return NextResponse.json({ success: true, data: channels });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  if (!body.name) {
    return NextResponse.json({ success: false, error: 'Show name is required' }, { status: 400 });
  }
  const created = await LearningService.createPodcastChannel(body);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
});
