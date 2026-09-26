import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LearningService } from '@/services/learningService';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await LearningService.updateResource(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await LearningService.deleteResource(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Resource not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Resource deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
