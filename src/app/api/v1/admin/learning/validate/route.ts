import { NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/withAdminAuth';
import { LearningService } from '@/services/learningService';

export const POST = withAdminAuth(async () => {
  const report = await LearningService.runLinkRotHealthCheck();
  return NextResponse.json({ success: true, data: report });
});
