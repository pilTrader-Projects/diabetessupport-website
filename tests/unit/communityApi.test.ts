/**
 * Unit Test Suite for Community Backend API & Ingestion Guardrails (Step 2).
 *
 * @usecase Validates UGC link sanitization, reserved alias blocking, thread CRUD, and reply OP detection.
 * @dependencies src/lib/communityUtils.ts, src/app/api/v1/community/threads/route.ts, src/app/api/v1/community/threads/[slug]/replies/route.ts.
 */
import {
  isAliasReserved,
  generateAuthorTag,
  sanitizeUgcContent,
  generateThreadSlug,
} from '../../src/lib/communityUtils';
import { GET as getThreads, POST as postThread } from '../../src/app/api/v1/community/threads/route';
import { GET as getReplies, POST as postReply } from '../../src/app/api/v1/community/threads/[slug]/replies/route';
import { ThreadModel } from '../../src/models/Thread';
import { ReplyModel } from '../../src/models/Reply';
import { NextRequest } from 'next/server';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/Thread', () => ({
  ThreadModel: {
    find: jest.fn(),
    findOne: jest.fn(),
    countDocuments: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}));

jest.mock('../../src/models/Reply', () => ({
  ReplyModel: {
    find: jest.fn(),
    create: jest.fn(),
  },
}));

describe('Community API & Ingestion Guardrails (Step 2)', () => {
  describe('communityUtils Ingestion Filters', () => {
    it('should detect reserved administrative and healthcare aliases', () => {
      expect(isAliasReserved('Admin')).toBe(true);
      expect(isAliasReserved('admin')).toBe(true);
      expect(isAliasReserved('Doctor Juan')).toBe(true);
      expect(isAliasReserved('Moderator')).toBe(true);
      expect(isAliasReserved('Kuya Jun')).toBe(false);
      expect(isAliasReserved('Mama Sarah')).toBe(false);
    });

    it('should generate a 4-digit author tag from authorId', () => {
      const tag = generateAuthorTag('usr_abc123');
      expect(tag).toMatch(/^#\d{4}$/);
    });

    it('should sanitize raw links and enforce rel="ugc nofollow"', () => {
      const input = 'Check this out https://example.com/guide for blood sugar.';
      const output = sanitizeUgcContent(input);
      expect(output).toContain('rel="ugc nofollow"');
      expect(output).toContain('target="_blank"');
    });

    it('should generate valid URL slugs from titles', () => {
      const slug = generateThreadSlug('Normal ba ang 140 fasting glucose sa umaga?');
      expect(slug).toContain('normal-ba-ang-140-fasting-glucose-sa-umaga');
    });
  });

  describe('POST /api/v1/community/threads', () => {
    it('should reject requests with missing title or content', async () => {
      const req = new NextRequest('http://localhost/api/v1/community/threads', {
        method: 'POST',
        body: JSON.stringify({ title: '', content: '' }),
      });

      const res = await postThread(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should reject reserved author display names', async () => {
      const req = new NextRequest('http://localhost/api/v1/community/threads', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Official Announcement',
          content: 'Important news...',
          authorAlias: 'Admin',
        }),
      });

      const res = await postThread(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.message).toContain('reserved');
    });

    it('should successfully create and return a new thread document', async () => {
      const mockCreated = {
        _id: 'thread_1',
        title: 'Morning Fasting Sugar Tips',
        slug: 'morning-fasting-sugar-tips-a1b2',
        content: 'Sharing my tips...',
        authorAlias: 'Kuya Jun',
        authorTag: '#4821',
        authorId: 'usr_123',
        status: 'published',
      };
      (ThreadModel.create as jest.Mock).mockResolvedValue(mockCreated);

      const req = new NextRequest('http://localhost/api/v1/community/threads', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Morning Fasting Sugar Tips',
          content: 'Sharing my tips...',
          authorAlias: 'Kuya Jun',
          authorId: 'usr_123',
        }),
      });

      const res = await postThread(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.authorAlias).toBe('Kuya Jun');
    });
  });

  describe('POST /api/v1/community/threads/[slug]/replies', () => {
    it('should detect when the replier is the thread OP (Original Poster)', async () => {
      const mockThread = {
        _id: 'thread_1',
        slug: 'fasting-tips',
        authorId: 'usr_123',
      };
      (ThreadModel.findOne as jest.Mock).mockResolvedValue(mockThread);

      const mockReply = {
        _id: 'reply_1',
        threadId: 'thread_1',
        content: 'Thanks for the answers everyone!',
        authorAlias: 'Kuya Jun',
        authorId: 'usr_123',
        isOp: true,
      };
      (ReplyModel.create as jest.Mock).mockResolvedValue(mockReply);
      (ThreadModel.findByIdAndUpdate as jest.Mock).mockResolvedValue(true);

      const req = new NextRequest('http://localhost/api/v1/community/threads/fasting-tips/replies', {
        method: 'POST',
        body: JSON.stringify({
          content: 'Thanks for the answers everyone!',
          authorAlias: 'Kuya Jun',
          authorId: 'usr_123', // Matches thread.authorId!
        }),
      });

      const context = { params: Promise.resolve({ slug: 'fasting-tips' }) };
      const res = await postReply(req, context);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.isOp).toBe(true);
      expect(ThreadModel.findByIdAndUpdate).toHaveBeenCalled();
    });
  });
});
