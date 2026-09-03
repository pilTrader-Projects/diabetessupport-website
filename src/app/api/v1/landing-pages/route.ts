import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { LandingPageModel } from '@/models/LandingPage';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { slugify } from '@/lib/auth';

/**
 * GET /api/v1/landing-pages
 *
 * @usecase Retrieves all active or managed landing pages.
 * @returns {Promise<NextResponse>} JSON list of landing page documents.
 */
export async function GET(_req?: Request): Promise<NextResponse> {
  await dbConnect();
  try {
    const pages = await LandingPageModel.find({}).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, data: pages });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch landing pages.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/landing-pages
 *
 * @usecase Authenticated route for creating a new Kit landing page mapping.
 * @param {Request} req HTTP Request with landing page JSON payload.
 * @returns {Promise<NextResponse>} Created landing page document or error response.
 */
export async function POST(req: Request): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized. Admin credentials required.' },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const { slug, title, description, kitScriptUrl, kitFormId, embedType, metaTitle, metaDescription, isActive } = body || {};

  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json(
      { success: false, error: 'Title is required.' },
      { status: 400 }
    );
  }

  const cleanSlug = slug ? slugify(slug) : slugify(title);
  if (!cleanSlug) {
    return NextResponse.json(
      { success: false, error: 'Valid slug is required.' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const existing = await LandingPageModel.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `A landing page with slug "${cleanSlug}" already exists.` },
        { status: 409 }
      );
    }

    const newPage = await LandingPageModel.create({
      slug: cleanSlug,
      title: title.trim(),
      description: description ? description.trim() : undefined,
      kitScriptUrl: kitScriptUrl ? kitScriptUrl.trim() : undefined,
      kitFormId: kitFormId ? kitFormId.trim() : undefined,
      embedType: embedType || 'script',
      metaTitle: metaTitle ? metaTitle.trim() : undefined,
      metaDescription: metaDescription ? metaDescription.trim() : undefined,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return NextResponse.json(
      { success: true, message: 'Landing page created successfully.', data: newPage },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create landing page.' },
      { status: 500 }
    );
  }
}
