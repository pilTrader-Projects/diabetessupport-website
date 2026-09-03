import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { PostModel } from '@/models/Post';
import { CategoryModel } from '@/models/Category';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { slugify } from '@/lib/auth';

import { getCategoryLookupMap, resolveCategoryName } from '@/lib/categoryUtils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/posts/[id]
 *
 * @usecase Retrieves a single blog post document by document ID.
 */
export async function GET(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  await dbConnect();
  try {
    const post: any = await PostModel.findById(id).lean();
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }
    const categoryMap = await getCategoryLookupMap();
    post.category = resolveCategoryName(post.category, categoryMap);
    return NextResponse.json({ success: true, data: post });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/v1/posts/[id]
 *
 * @usecase Updates an existing blog post document in MongoDB (title, content, category, status, etc.).
 */
export async function PUT(req: Request, { params }: RouteParams): Promise<NextResponse> {
  const isAuth = await isAdminAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
  }

  await dbConnect();

  try {
    const updateData: any = { ...body };

    if (updateData.title && typeof updateData.title === 'string') {
      updateData.title = updateData.title.trim();
    }

    if (updateData.content && typeof updateData.content === 'string') {
      updateData.content = updateData.content.trim();
    }

    if (updateData.slug && typeof updateData.slug === 'string') {
      updateData.slug = slugify(updateData.slug);
    }

    if (updateData.category && typeof updateData.category === 'string') {
      updateData.category = updateData.category.trim();
      const categorySlug = slugify(updateData.category);
      await CategoryModel.updateOne(
        { slug: categorySlug },
        {
          $setOnInsert: {
            name: updateData.category,
            slug: categorySlug,
            description: `${updateData.category} articles and health guidance`,
          },
        },
        { upsert: true }
      );
    }

    const updated = await PostModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post updated successfully.', data: updated });
  } catch (err: any) {
    console.error('Error updating post:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
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
