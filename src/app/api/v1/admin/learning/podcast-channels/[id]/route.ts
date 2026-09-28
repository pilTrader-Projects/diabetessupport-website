import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { LearningService } from '@/services/learningService';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const channel = await LearningService.getPodcastChannelById(id);
    if (!channel) {
      return NextResponse.json({ success: false, error: 'Podcast channel not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: channel });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await LearningService.updatePodcastChannel(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Podcast channel not found' }, { status: 404 });
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
    const deleted = await LearningService.deletePodcastChannel(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Podcast channel not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Podcast channel deleted' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
