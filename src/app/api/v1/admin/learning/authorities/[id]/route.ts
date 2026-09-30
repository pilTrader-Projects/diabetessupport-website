import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';

export const PUT = withAdminAuth(async (req, { params }) => {
  const { id } = await params;
  const body = await req.json();
  const updated = await LearningService.updateAuthority(id, body);
  if (!updated) {
    return NextResponse.json({ success: false, error: 'Authority not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: updated });
});

export const DELETE = withAdminAuth(async (_req, { params }) => {
  const { id } = await params;
  const deleted = await LearningService.deleteAuthority(id);
  if (!deleted) {
    return NextResponse.json({ success: false, error: 'Authority not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Authority deleted' });
});
