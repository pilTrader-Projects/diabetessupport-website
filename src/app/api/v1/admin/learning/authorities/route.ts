import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';

export const GET = withAdminAuth(async () => {
  const authorities = await LearningService.listAuthorities();
  return NextResponse.json({ success: true, data: authorities });
});

export const POST = withAdminAuth(async (req) => {
  const body = await req.json();
  if (!body.name || !body.title) {
    return NextResponse.json({ success: false, error: 'Name and title are required' }, { status: 400 });
  }
  const created = await LearningService.createAuthority(body);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
});
