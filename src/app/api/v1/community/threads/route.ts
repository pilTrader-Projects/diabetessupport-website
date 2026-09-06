import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ThreadModel } from '@/models/Thread';
import {
  isAliasReserved,
  generateAuthorTag,
  sanitizeUgcContent,
  generateThreadSlug,
} from '@/lib/communityUtils';

/**
 * GET Handler for Community Threads Collection.
 *
 * @usecase Returns paginated list of published community topics with optional category filter and keyword search.
 * @dependencies dbConnect, ThreadModel.
 * @param {NextRequest} req Incoming HTTP request containing query params.
 * @returns {Promise<NextResponse>} JSON response with threads array and pagination metadata.
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const query: any = { status: 'published' };
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    const [threads, total] = await Promise.all([
      ThreadModel.find(query)
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ThreadModel.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: threads,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching community threads:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve community threads' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler for Creating Community Discussion Threads.
 *
 * @usecase Validates input, sanitizes links with rel="ugc nofollow", blocks reserved aliases, and saves new thread.
 * @dependencies dbConnect, ThreadModel, communityUtils.
 * @param {NextRequest} req Incoming HTTP request containing thread payload.
 * @returns {Promise<NextResponse>} JSON response with created thread document.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await dbConnect();
    const body = await req.json();
    const { title, content, category, authorAlias, authorId, authorEmail, notifyOnReply } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, message: 'Thread title is required' },
        { status: 400 }
      );
    }
    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Thread content is required' },
        { status: 400 }
      );
    }

    const cleanAlias = (authorAlias || 'Community Member').trim();
    if (isAliasReserved(cleanAlias)) {
      return NextResponse.json(
        {
          success: false,
          message: 'The requested display name is reserved. Please choose a different nickname.',
        },
        { status: 400 }
      );
    }

    const assignedAuthorId = (authorId || `usr_${Math.random().toString(36).substring(2, 10)}`).trim();
    const authorTag = generateAuthorTag(assignedAuthorId);
    const sanitizedContent = sanitizeUgcContent(content.trim());
    const slug = generateThreadSlug(title.trim());

    const newThread = await ThreadModel.create({
      title: title.trim(),
      slug,
      content: sanitizedContent,
      category: (category || 'General Support').trim(),
      authorAlias: cleanAlias,
      authorTag,
      authorId: assignedAuthorId,
      authorEmail: authorEmail?.trim() || undefined,
      notifyOnReply: Boolean(notifyOnReply),
      status: 'published',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Discussion thread created successfully',
        data: newThread,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating community thread:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create discussion thread' },
      { status: 500 }
    );
  }
}
