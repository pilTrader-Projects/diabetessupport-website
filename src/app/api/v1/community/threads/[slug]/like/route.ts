import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ThreadModel } from '@/models/Thread';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/v1/community/threads/[slug]/like
 *
 * @usecase Increments like reaction counter on discussion threads atomically with zero-password optimistic client support.
 */
export async function POST(req: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    await dbConnect();
    const thread = await ThreadModel.findOneAndUpdate(
      { slug, status: { $ne: 'archived' } },
      { $inc: { likes: 1 } },
      { new: true }
    ).lean();

    if (!thread) {
      return NextResponse.json({ success: false, error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      likes: thread.likes || 1,
    });
  } catch (err: any) {
    console.error('Error liking thread:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
