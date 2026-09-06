/**
 * Unit Test Suite for Zero-Password Device Sync & Notification Engine (Step 3).
 *
 * @usecase Validates 6-digit device sync code generation/claiming and safe conditional notification delivery.
 * @dependencies src/lib/communityNotifications.ts, src/app/api/v1/community/sync/route.ts, src/models/DeviceSync.ts.
 */
import { sendReplyNotification } from '../../src/lib/communityNotifications';
import { POST as generateSyncCode, PUT as claimSyncCode } from '../../src/app/api/v1/community/sync/route';
import { DeviceSyncModel } from '../../src/models/DeviceSync';
import { NextRequest } from 'next/server';

jest.mock('../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../src/models/DeviceSync', () => ({
  DeviceSyncModel: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe('Zero-Password Device Sync & Notification Engine (Step 3)', () => {
  describe('sendReplyNotification Handler', () => {
    it('should safely skip when author has no email configured', async () => {
      const result = await sendReplyNotification({
        authorAlias: 'Kuya Jun',
        replierName: 'Mama Sarah',
        threadTitle: 'Fasting Glucose Tips',
        threadSlug: 'fasting-glucose-tips',
      });

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('no_email_provided');
    });

    it('should safely no-op in sandbox mode without throwing errors', async () => {
      const result = await sendReplyNotification({
        authorEmail: 'kuyajun@example.com',
        authorAlias: 'Kuya Jun',
        replierName: 'Mama Sarah',
        threadTitle: 'Fasting Glucose Tips',
        threadSlug: 'fasting-glucose-tips',
      });

      expect(result.sent).toBe(false);
      expect(result.reason).toBe('notifications_disabled_in_sandbox');
    });
  });

  describe('POST /api/v1/community/sync (Generate Sync Code)', () => {
    it('should reject requests missing authorId or authorAlias', async () => {
      const req = new NextRequest('http://localhost/api/v1/community/sync', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const res = await generateSyncCode(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });

    it('should generate a 6-digit numeric sync code', async () => {
      const mockCreated = {
        code: '582194',
        authorId: 'usr_abc123',
        authorAlias: 'Kuya Jun',
        authorTag: '#4821',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      };
      (DeviceSyncModel.create as jest.Mock).mockResolvedValue(mockCreated);

      const req = new NextRequest('http://localhost/api/v1/community/sync', {
        method: 'POST',
        body: JSON.stringify({
          authorId: 'usr_abc123',
          authorAlias: 'Kuya Jun',
          authorTag: '#4821',
        }),
      });

      const res = await generateSyncCode(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.code).toBe('582194');
    });
  });

  describe('PUT /api/v1/community/sync (Claim Sync Code)', () => {
    it('should return 404 when code is invalid or expired', async () => {
      (DeviceSyncModel.findOne as jest.Mock).mockResolvedValue(null);

      const req = new NextRequest('http://localhost/api/v1/community/sync', {
        method: 'PUT',
        body: JSON.stringify({ code: '999999' }),
      });

      const res = await claimSyncCode(req);
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.success).toBe(false);
    });

    it('should successfully claim valid code and return author credentials', async () => {
      const mockDoc = {
        code: '582194',
        authorId: 'usr_abc123',
        authorAlias: 'Kuya Jun',
        authorTag: '#4821',
        claimed: false,
        save: jest.fn().mockResolvedValue(true),
      };
      (DeviceSyncModel.findOne as jest.Mock).mockResolvedValue(mockDoc);

      const req = new NextRequest('http://localhost/api/v1/community/sync', {
        method: 'PUT',
        body: JSON.stringify({ code: '582194' }),
      });

      const res = await claimSyncCode(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.authorAlias).toBe('Kuya Jun');
      expect(mockDoc.claimed).toBe(true);
    });
  });
});
