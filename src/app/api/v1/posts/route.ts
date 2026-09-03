import { NextResponse } from 'next/server';
import { dbConnect } from '../../../../lib/dbConnect';
import { PostModel } from '../../../../models/Post';
import { CategoryModel } from '../../../../models/Category';
import { validateApiKey, slugify } from '../../../../lib/auth';
import { isAdminAuthenticated } from '../../../../lib/adminAuth';
import { getCategoryLookupMap, resolveCategoryName } from '../../../../lib/categoryUtils';

/**
 * HTTP POST API route handler for automated blog post publishing.
 *
 * @usecase Accepts AI-generated or external CMS articles via authenticated REST request and saves them to MongoDB.
 * @param {Request} req Incoming Next.js standard Web API HTTP Request object.
 * @dependencies validateApiKey, slugify, dbConnect, PostModel, CategoryModel.
 * @returns {Promise<NextResponse>} JSON response containing created post entity or validation error message.
 * @throws {Error} Returns 401 Unauthorized for invalid keys, 400 Bad Request for invalid payload, 500 for server errors.
 */
export async function POST(req: Request): Promise<NextResponse> {
  // 1. Authenticate request via Admin Cookie OR API key
  const isAdmin = await isAdminAuthenticated(req);
  if (!isAdmin) {
    const authResult = await validateApiKey(req);
    if (!authResult.valid) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Unauthorized request.' },
        { status: 401 }
      );
    }
  }

  // 2. Parse request JSON body
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request payload.' },
      { status: 400 }
    );
  }

  const {
    title,
    content,
    slug: rawSlug,
    excerpt,
    featuredImage,
    category = 'General',
    tags = [],
    status = 'published',
    seoTitle,
    metaDescription,
    publishedAt,
  } = body;

  // 3. Validate required fields
  if (!title || typeof title !== 'string' || !title.trim()) {
    return NextResponse.json(
      { success: false, error: 'Title is a required field.' },
      { status: 400 }
    );
  }

  if (!content || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json(
      { success: false, error: 'Content is a required field.' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();

    // 4. Generate & deduplicate slug
    let baseSlug = rawSlug ? slugify(rawSlug) : slugify(title);
    if (!baseSlug) {
      baseSlug = `post-${Date.now()}`;
    }

    let finalSlug = baseSlug;
    const existingPost = await PostModel.findOne({ slug: finalSlug });
    if (existingPost) {
      finalSlug = `${baseSlug}-${Date.now().toString(36)}`;
    }

    // 5. Build post document
    const formattedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const postData = {
      title: title.trim(),
      slug: finalSlug,
      content: content.trim(),
      excerpt: excerpt ? excerpt.trim() : title.trim(),
      featuredImage: featuredImage ? featuredImage.trim() : undefined,
      category: category ? category.trim() : 'General',
      tags: formattedTags,
      status: ['draft', 'published', 'archived'].includes(status) ? status : 'published',
      seoTitle: seoTitle ? seoTitle.trim() : title.trim(),
      metaDescription: metaDescription ? metaDescription.trim() : excerpt ? excerpt.trim() : undefined,
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
    };

    // 6. Persist Post to MongoDB
    const post = await PostModel.create(postData);

    // 7. Upsert Category if defined
    if (postData.category) {
      const categorySlug = slugify(postData.category);
      await CategoryModel.updateOne(
        { slug: categorySlug },
        {
          $setOnInsert: {
            name: postData.category,
            slug: categorySlug,
            description: `${postData.category} articles and health guidance`,
          },
        },
        { upsert: true }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Post published successfully.',
        data: post,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating post via publishing API:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

/**
 * HTTP GET API route handler for querying published blog posts.
 *
 * @usecase Serves paginated, filterable post data for search, category filtering, and external consumers.
 * @param {Request} req Incoming Next.js HTTP Request object with searchParams.
 * @dependencies dbConnect, PostModel.
 * @returns {Promise<NextResponse>} JSON response containing array of blog posts and pagination metadata.
 */
export async function GET(req: Request): Promise<NextResponse> {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const statusParam = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (statusParam) {
      query.status = statusParam;
    } else {
      query.status = { $in: ['published', 'draft'] };
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { content: searchRegex }, { tags: searchRegex }];
    }

    const categoryMap = await getCategoryLookupMap();

    const [posts, total] = await Promise.all([
      PostModel.find(query).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
      PostModel.countDocuments(query),
    ]);

    const formattedPosts = posts.map((post: any) => ({
      ...post,
      category: resolveCategoryName(post.category, categoryMap),
    }));

    return NextResponse.json({
      success: true,
      data: formattedPosts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('Error fetching posts:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
