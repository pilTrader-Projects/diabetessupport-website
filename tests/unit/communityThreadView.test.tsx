import React from 'react';
import ReplyCard from '@/components/community/ReplyCard';
import ReplyForm from '@/components/community/ReplyForm';
import ThreadViewClient from '@/components/community/ThreadViewClient';
import { buildDiscussionForumPostingSchema } from '@/lib/schema';
import { IThread, IReply } from '@/types/community';

describe('Community Thread View & Reply Components (Step 5)', () => {
  const sampleThread: IThread = {
    _id: 'thread-123',
    title: 'Tips for managing post-prandial blood sugar spikes',
    slug: 'tips-for-managing-spikes',
    content: 'What are your go-to habits right after lunch to avoid sudden glucose spikes?',
    category: 'Daily Living',
    authorAlias: 'Kuya Jun',
    authorTag: '#4821',
    authorId: 'auth-123',
    status: 'published',
    reportCount: 0,
    views: 45,
    repliesCount: 2,
    createdAt: new Date('2026-09-01T10:00:00Z'),
  };

  const sampleReplies: IReply[] = [
    {
      _id: 'reply-1',
      threadId: 'thread-123',
      content: 'A 15-minute brisk walk right after eating works wonders for me.',
      authorAlias: 'Ate Maria',
      authorTag: '#9120',
      authorId: 'auth-456',
      isOp: false,
      status: 'published',
      reportCount: 0,
      createdAt: new Date('2026-09-01T11:00:00Z'),
    },
    {
      _id: 'reply-2',
      threadId: 'thread-123',
      content: 'Thanks Ate Maria! I also tried apple cider vinegar before meals.',
      authorAlias: 'Kuya Jun',
      authorTag: '#4821',
      authorId: 'auth-123',
      isOp: true,
      status: 'published',
      reportCount: 0,
      createdAt: new Date('2026-09-01T12:00:00Z'),
    },
  ];

  describe('DiscussionForumPosting JSON-LD Schema', () => {
    it('generates valid Schema.org DiscussionForumPosting structured data', () => {
      const schema = buildDiscussionForumPostingSchema(sampleThread, sampleReplies);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('DiscussionForumPosting');
      expect(schema.headline).toBe(sampleThread.title);
      expect(schema.articleBody).toBe(sampleThread.content);
      expect(schema.author.name).toBe('Kuya Jun (#4821)');
      expect(schema.interactionStatistic.userInteractionCount).toBe(2);
      expect(schema.comment).toHaveLength(2);
      expect(schema.comment[0].text).toBe(sampleReplies[0].content);
      expect(schema.comment[0].author.name).toBe('Ate Maria (#9120)');
    });
  });

  describe('ReplyCard Component', () => {
    it('renders reply details and badges correctly', () => {
      const el = (
        <ReplyCard
          reply={sampleReplies[1]}
          isOp={true}
          isYou={false}
        />
      );

      expect(el.props.reply.authorAlias).toBe('Kuya Jun');
      expect(el.props.isOp).toBe(true);
      expect(el.props.isYou).toBe(false);
    });
  });

  describe('ReplyForm Component', () => {
    it('initializes with proper threadSlug and callback', () => {
      const onReplyAdded = jest.fn();
      const el = <ReplyForm threadSlug="test-slug" onReplyAdded={onReplyAdded} />;

      expect(el.props.threadSlug).toBe('test-slug');
      expect(typeof el.props.onReplyAdded).toBe('function');
    });
  });

  describe('ThreadViewClient Component', () => {
    it('initializes with thread and initial replies data', () => {
      const el = <ThreadViewClient thread={sampleThread} initialReplies={sampleReplies} />;

      expect(el.props.thread.title).toBe(sampleThread.title);
      expect(el.props.initialReplies).toHaveLength(2);
      expect(el.props.thread.status).toBe('published');
    });

    it('supports quarantined status when reported', () => {
      const flaggedThread: IThread = {
        ...sampleThread,
        status: 'flagged',
        reportCount: 3,
      };
      const el = <ThreadViewClient thread={flaggedThread} initialReplies={sampleReplies} />;
      expect(el.props.thread.status).toBe('flagged');
      expect(el.props.thread.reportCount).toBe(3);
    });
  });
});
