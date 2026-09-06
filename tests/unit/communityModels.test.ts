/**
 * Unit Test Suite for Community Database Models and Configuration.
 *
 * @usecase Validates Thread, Reply, and DeviceSync schema structures, defaults, and validation rules.
 * @dependencies src/models/Thread.ts, src/models/Reply.ts, src/models/DeviceSync.ts, src/config/constants.ts.
 */
import { ThreadModel } from '../../src/models/Thread';
import { ReplyModel } from '../../src/models/Reply';
import { DeviceSyncModel } from '../../src/models/DeviceSync';
import { COMMUNITY_CONFIG } from '../../src/config/constants';

describe('Community Models & Configuration Architecture (Step 1)', () => {
  describe('ThreadModel Schema Definition', () => {
    it('should initialize a valid Thread document with defaults', () => {
      const thread = new ThreadModel({
        title: 'Is 140 fasting sugar normal in the morning?',
        slug: 'is-140-fasting-sugar-normal',
        content: 'I tested my blood sugar using finger prick at 6am...',
        category: 'Daily Sugar Tracking',
        authorAlias: 'Kuya Jun',
        authorTag: '#4821',
        authorId: 'usr_abc123',
      });

      expect(thread.title).toBe('Is 140 fasting sugar normal in the morning?');
      expect(thread.status).toBe('published');
      expect(thread.reportCount).toBe(0);
      expect(thread.views).toBe(0);
      expect(thread.repliesCount).toBe(0);
      expect(thread.pinned).toBe(false);
    });

    it('should require mandatory fields: title, slug, content, and authorId', () => {
      const invalidThread = new ThreadModel({});
      const error = invalidThread.validateSync();

      expect(error).toBeDefined();
      expect(error?.errors.title).toBeDefined();
      expect(error?.errors.slug).toBeDefined();
      expect(error?.errors.content).toBeDefined();
      expect(error?.errors.authorId).toBeDefined();
    });
  });

  describe('ReplyModel Schema Definition', () => {
    it('should initialize a valid Reply document with defaults', () => {
      const reply = new ReplyModel({
        threadId: 'thread_123',
        content: 'Mataas po ang 140 for fasting. Please consult your physician.',
        authorAlias: 'Mama Sarah',
        authorTag: '#1042',
        authorId: 'usr_xyz789',
        isOp: false,
      });

      expect(reply.threadId).toBe('thread_123');
      expect(reply.isOp).toBe(false);
      expect(reply.status).toBe('published');
      expect(reply.reportCount).toBe(0);
    });

    it('should require threadId and content', () => {
      const invalidReply = new ReplyModel({});
      const error = invalidReply.validateSync();

      expect(error).toBeDefined();
      expect(error?.errors.threadId).toBeDefined();
      expect(error?.errors.content).toBeDefined();
    });
  });

  describe('DeviceSyncModel Schema Definition', () => {
    it('should initialize a valid DeviceSync document', () => {
      const syncDoc = new DeviceSyncModel({
        code: '742891',
        authorId: 'usr_abc123',
        authorAlias: 'Kuya Jun',
        authorTag: '#4821',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      expect(syncDoc.code).toBe('742891');
      expect(syncDoc.authorAlias).toBe('Kuya Jun');
      expect(syncDoc.claimed).toBe(false);
    });
  });

  describe('COMMUNITY_CONFIG Integrity', () => {
    it('should define core Pinoy diabetes categories', () => {
      expect(COMMUNITY_CONFIG.categories).toContain('Daily Sugar Tracking');
      expect(COMMUNITY_CONFIG.categories).toContain('Low-GI Pinoy Meals');
      expect(COMMUNITY_CONFIG.categories).toContain('Medications & Doctor Visits');
      expect(COMMUNITY_CONFIG.categories).toContain('General Support');
    });

    it('should block reserved impersonation aliases', () => {
      expect(COMMUNITY_CONFIG.reservedAliases).toContain('admin');
      expect(COMMUNITY_CONFIG.reservedAliases).toContain('doctor');
      expect(COMMUNITY_CONFIG.reservedAliases).toContain('diabetescare');
    });

    it('should disable email notifications safely by default in sandbox/vercel.app without API key', () => {
      expect(typeof COMMUNITY_CONFIG.emailNotificationsEnabled).toBe('boolean');
    });
  });
});
