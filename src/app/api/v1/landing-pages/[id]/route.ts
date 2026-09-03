import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LandingPageModel } from '@/models/LandingPage';
import { isAdminAuthenticated } from '@/lib/adminAuth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PUT /api/v1/landing-pages/[id]
 *
 * @usecase Updates an existing landing page record by document ID.
 */
export async function PUT(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  await dbConnect();
  try {
    const updated = await LandingPageModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Landing page not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/v1/landing-pages/[id]
 *
 * @usecase Deletes a landing page record by document ID.
 */
export async function DELETE(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  await dbConnect();
  try {
    const deleted = await LandingPageModel.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Landing page not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Landing page deleted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
