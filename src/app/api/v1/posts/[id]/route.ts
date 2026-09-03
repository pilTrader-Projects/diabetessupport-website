import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/posts/[id]
 *
 * @usecase Deletes a blog post document by document ID.
 */
export async function DELETE(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  try {
    const deleted = await PostModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Post deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
