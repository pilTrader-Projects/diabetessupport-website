import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import { ThreadModel } from '@/models/Thread';
import { ReplyModel } from '@/models/Reply';
import {
  isAliasReserved,
  generateAuthorTag,
  sanitizeUgcContent,
} from '@/lib/communityUtils';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

/**
 * GET Handler for Thread Replies.
 *
 * @usecase Retrieves all active replies for a given discussion thread slug.
 * @dependencies dbConnect, ThreadModel, ReplyModel.
 * @param {NextRequest} req Incoming HTTP request.
 * @param {RouteContext} context Route context containing thread slug.
 * @returns {Promise<NextResponse>} JSON response with replies array.
 */
export async function GET(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await dbConnect();
    const { slug } = await context.params;

    const thread = await ThreadModel.findOne({ slug, status: 'published' }).lean();
    if (!thread) {
      return NextResponse.json(
        { success: false, message: 'Discussion thread not found' },
        { status: 404 }
      );
    }

    const replies = await ReplyModel.find({
      threadId: thread._id.toString(),
      status: 'published',
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: replies,
      thread: {
        _id: thread._id,
        title: thread.title,
        slug: thread.slug,
      },
    });
  } catch (error: any) {
    console.error('Error fetching thread replies:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve replies' },
      { status: 500 }
    );
  }
}

/**
 * POST Handler for Creating a Thread Reply.
 *
 * @usecase Adds response comment, verifies OP status, sanitizes links, and increments thread repliesCount.
 * @dependencies dbConnect, ThreadModel, ReplyModel, communityUtils.
 * @param {NextRequest} req Incoming HTTP request with reply payload.
 * @param {RouteContext} context Route context containing thread slug.
 * @returns {Promise<NextResponse>} JSON response with created reply document.
 */
export async function POST(
  req: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    await dbConnect();
    const { slug } = await context.params;
    const thread = await ThreadModel.findOne({ slug, status: 'published' });

    if (!thread) {
      return NextResponse.json(
        { success: false, message: 'Discussion thread not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { content, authorAlias, authorId, authorEmail } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: 'Reply content cannot be empty' },
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
    const isOp = assignedAuthorId === thread.authorId;

    const newReply = await ReplyModel.create({
      threadId: thread._id.toString(),
      content: sanitizedContent,
      authorAlias: cleanAlias,
      authorTag,
      authorId: assignedAuthorId,
      authorEmail: authorEmail?.trim() || undefined,
      isOp,
      status: 'published',
    });

    // Increment thread reply counter
    await ThreadModel.findByIdAndUpdate(thread._id, {
      $inc: { repliesCount: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Reply posted successfully',
        data: newReply,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error posting thread reply:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to post reply' },
      { status: 500 }
    );
  }
}
