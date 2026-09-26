import { NextResponse } from 'next/server';
import { LearningService } from '@/services/learningService';

export async function GET() {
  try {
    const authorities = await LearningService.listAuthorities({ activeOnly: true });
    return NextResponse.json({ success: true, data: authorities });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
