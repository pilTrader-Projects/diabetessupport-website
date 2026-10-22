import crypto from 'crypto';
import { hashEmail, exportUserData, deleteUserData } from '../../../scripts/data-request';
import { DataRequestLogModel } from '../../../src/models/DataRequestLog';
import { ConsentRecordModel } from '../../../src/models/ConsentRecord';
import { LeadModel } from '../../../src/models/Lead';
import { AssetDownloadTokenModel } from '../../../src/models/AssetDownloadToken';
import { ThreadModel } from '../../../src/models/Thread';
import { ReplyModel } from '../../../src/models/Reply';
import { BrevoService } from '../../../src/services/brevoService';
import { dbConnect } from '../../../src/lib/dbConnect';

// Mock database connection
jest.mock('../../../src/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

// Mock Mongoose models
jest.mock('../../../src/models/ConsentRecord', () => ({
  ConsentRecordModel: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock('../../../src/models/Lead', () => ({
  LeadModel: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock('../../../src/models/AssetDownloadToken', () => ({
  AssetDownloadTokenModel: {
    find: jest.fn(),
    deleteMany: jest.fn(),
  },
}));

jest.mock('../../../src/models/Thread', () => ({
  ThreadModel: {
    find: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('../../../src/models/Reply', () => ({
  ReplyModel: {
    find: jest.fn(),
    updateMany: jest.fn(),
  },
}));

jest.mock('../../../src/models/DataRequestLog', () => {
  const actual = jest.requireActual('../../../src/models/DataRequestLog');
  return {
    ...actual,
    DataRequestLogModel: {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    },
  };
});

// Mock BrevoService
jest.mock('../../../src/services/brevoService', () => ({
  BrevoService: {
    getContact: jest.fn(),
    deleteContact: jest.fn(),
  },
}));

describe('Data Rights Management Tooling (scripts/data-request.ts)', () => {
  const testEmail = 'patient.juan@example.ph';
  const expectedHash = hashEmail(testEmail);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashEmail() - Anonymization & Data Minimization', () => {
    it('computes a deterministic 64-character HMAC-SHA256 hex hash', () => {
      const hash = hashEmail(testEmail);
      expect(hash).toHaveLength(64);
      expect(hash).toBe(expectedHash);
    });

    it('normalizes uppercase letters and surrounding whitespace', () => {
      const dirtyEmail = '  PATIENT.JUAN@EXAMPLE.PH  ';
      expect(hashEmail(dirtyEmail)).toBe(expectedHash);
    });

    it('produces distinct hashes for distinct email addresses', () => {
      const hash1 = hashEmail('user1@example.com');
      const hash2 = hashEmail('user2@example.com');
      expect(hash1).not.toBe(hash2);
    });

    it('supports custom salt secret keys', () => {
      const customHash = hashEmail(testEmail, 'custom_secret_key_123');
      expect(customHash).toHaveLength(64);
      expect(customHash).not.toBe(expectedHash);
    });
  });

  describe('DataRequestLogModel Schema Validation', () => {
    const ActualDataRequestLogModel = jest.requireActual('../../../src/models/DataRequestLog').DataRequestLogModel;

    it('validates a correct DataRequestLog document', async () => {
      const doc = new ActualDataRequestLogModel({
        emailHash: expectedHash,
        action: 'export',
        operator: 'cli_admin',
        details: { count: 1 },
      });

      const err = await doc.validate().catch((e: any) => e);
      expect(err).toBeUndefined();
      expect(doc.status).toBe('success');
      expect(doc.operator).toBe('cli_admin');
    });

    it('rejects document if emailHash is missing', async () => {
      const doc = new ActualDataRequestLogModel({
        action: 'export',
      });

      const err = await doc.validate().catch((e: any) => e);
      expect(err).toBeDefined();
      expect(err.errors.emailHash).toBeDefined();
    });

    it('rejects document if action is not export or delete', async () => {
      const doc = new ActualDataRequestLogModel({
        emailHash: expectedHash,
        action: 'invalid_action' as any,
      });

      const err = await doc.validate().catch((e: any) => e);
      expect(err).toBeDefined();
      expect(err.errors.action).toBeDefined();
    });
  });

  describe('exportUserData() - Subject Access & Portability', () => {
    it('throws error if email is invalid or missing', async () => {
      await expect(exportUserData('')).rejects.toThrow('A valid email address is required');
      await expect(exportUserData('not-an-email')).rejects.toThrow('A valid email address is required');
    });

    it('aggregates all user records from MongoDB and Brevo and writes audit log with emailHash', async () => {
      // Mock db queries lean returns
      (ConsentRecordModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'c1', email: testEmail, category: 'marketing' }]),
      });
      (LeadModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'l1', email: testEmail, firstName: 'Juan' }]),
      });
      (AssetDownloadTokenModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 't1', createdBy: testEmail, token: 'xyz' }]),
      });
      (ThreadModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'th1', title: 'Managing Glucose', authorEmail: testEmail }]),
      });
      (ReplyModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ _id: 'r1', content: 'Helpful tips', authorEmail: testEmail }]),
      });
      (BrevoService.getContact as jest.Mock).mockResolvedValue({
        success: true,
        contact: { email: testEmail, id: 999, emailBlacklisted: false },
      });
      (DataRequestLogModel.create as jest.Mock).mockResolvedValue({ _id: 'log1' });

      const report = await exportUserData('  PATIENT.JUAN@EXAMPLE.PH ');

      expect(dbConnect).toHaveBeenCalled();
      expect(report.email).toBe(testEmail);
      expect(report.emailHash).toBe(expectedHash);
      expect(report.summary).toEqual({
        consentRecordsCount: 1,
        leadsCount: 1,
        tokensCount: 1,
        threadsCount: 1,
        repliesCount: 1,
        brevoFound: true,
      });
      expect(report.data.consentRecords).toHaveLength(1);
      expect(report.data.leads).toHaveLength(1);
      expect(report.data.downloadTokens).toHaveLength(1);
      expect(report.data.communityThreads).toHaveLength(1);
      expect(report.data.communityReplies).toHaveLength(1);
      expect(report.data.brevoContact).toEqual({ email: testEmail, id: 999, emailBlacklisted: false });

      // Verify audit log creation: strictly stores SHA-256 hash, NEVER raw email
      expect(DataRequestLogModel.create).toHaveBeenCalledWith({
        emailHash: expectedHash,
        action: 'export',
        status: 'success',
        operator: 'cli_admin',
        details: {
          consentRecordsFound: 1,
          leadsFound: 1,
          tokensFound: 1,
          threadsFound: 1,
          repliesFound: 1,
          brevoContactFound: true,
        },
      });
    });

    it('handles export when Brevo contact does not exist', async () => {
      (ConsentRecordModel.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (LeadModel.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (AssetDownloadTokenModel.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (ThreadModel.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (ReplyModel.find as jest.Mock).mockReturnValue({ lean: jest.fn().mockResolvedValue([]) });
      (BrevoService.getContact as jest.Mock).mockResolvedValue({
        success: true,
        contact: null,
      });
      (DataRequestLogModel.create as jest.Mock).mockResolvedValue({ _id: 'log2' });

      const report = await exportUserData(testEmail);
      expect(report.summary.brevoFound).toBe(false);
      expect(report.data.brevoContact).toBeNull();
    });
  });

  describe('deleteUserData() - Erasure & Anonymization', () => {
    it('throws validation error if email is invalid', async () => {
      await expect(deleteUserData('', { confirm: true })).rejects.toThrow(
        'A valid email address is required for data deletion.'
      );
    });

    it('MANDATORY SAFETY GUARD: throws safety halt error if confirm option is missing or false', async () => {
      await expect(deleteUserData(testEmail)).rejects.toThrow(
        'Safety Halt: Deletion requires explicit --confirm flag to proceed.'
      );
      await expect(deleteUserData(testEmail, { confirm: false })).rejects.toThrow(
        'Safety Halt: Deletion requires explicit --confirm flag to proceed.'
      );

      // Verify NO destructive operations were invoked
      expect(ConsentRecordModel.deleteMany).not.toHaveBeenCalled();
      expect(LeadModel.deleteMany).not.toHaveBeenCalled();
      expect(AssetDownloadTokenModel.deleteMany).not.toHaveBeenCalled();
      expect(ThreadModel.updateMany).not.toHaveBeenCalled();
      expect(ReplyModel.updateMany).not.toHaveBeenCalled();
      expect(BrevoService.deleteContact).not.toHaveBeenCalled();
      expect(DataRequestLogModel.create).not.toHaveBeenCalled();
    });

    it('cascades deletion, anonymizes community threads/replies, deletes Brevo contact, and logs audit', async () => {
      (ConsentRecordModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 2 });
      (LeadModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (AssetDownloadTokenModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 3 });
      (ThreadModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 4 });
      (ReplyModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 5 });
      (BrevoService.deleteContact as jest.Mock).mockResolvedValue({ success: true, deleted: true });
      (DataRequestLogModel.create as jest.Mock).mockResolvedValue({ _id: 'log3' });

      const report = await deleteUserData(testEmail, { confirm: true });

      expect(dbConnect).toHaveBeenCalled();
      expect(ConsentRecordModel.deleteMany).toHaveBeenCalledWith({ email: testEmail });
      expect(LeadModel.deleteMany).toHaveBeenCalledWith({ email: testEmail });
      expect(AssetDownloadTokenModel.deleteMany).toHaveBeenCalledWith({ createdBy: testEmail });

      // Community preservation: authorEmail cleared, notifyOnReply set to false, authorAlias anonymized
      expect(ThreadModel.updateMany).toHaveBeenCalledWith(
        { authorEmail: testEmail },
        { $set: { authorEmail: null, notifyOnReply: false, authorAlias: 'Anonymized Member' } }
      );
      expect(ReplyModel.updateMany).toHaveBeenCalledWith(
        { authorEmail: testEmail },
        { $set: { authorEmail: null, authorAlias: 'Anonymized Member' } }
      );

      expect(BrevoService.deleteContact).toHaveBeenCalledWith(testEmail);

      expect(report.status).toBe('success');
      expect(report.emailHash).toBe(expectedHash);
      expect(report.summary).toEqual({
        consentRecordsDeleted: 2,
        leadsDeleted: 1,
        tokensDeleted: 3,
        threadsAnonymized: 4,
        repliesAnonymized: 5,
        brevoDeleted: true,
      });

      // Audit Log Verification
      expect(DataRequestLogModel.create).toHaveBeenCalledWith({
        emailHash: expectedHash,
        action: 'delete',
        status: 'success',
        operator: 'cli_admin',
        details: {
          consentRecordsDeleted: 2,
          leadsDeleted: 1,
          tokensDeleted: 3,
          threadsAnonymized: 4,
          repliesAnonymized: 5,
          brevoDeleted: true,
          error: undefined,
        },
      });
    });

    it('records partial status if Brevo deletion reports failure', async () => {
      (ConsentRecordModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (LeadModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
      (AssetDownloadTokenModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 0 });
      (ThreadModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });
      (ReplyModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 });
      (BrevoService.deleteContact as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Brevo Rate Limit',
      });
      (DataRequestLogModel.create as jest.Mock).mockResolvedValue({ _id: 'log4' });

      const report = await deleteUserData(testEmail, { confirm: true });

      expect(report.status).toBe('partial');
      expect(report.summary.brevoDeleted).toBe(false);
      expect(report.error).toBe('Brevo Rate Limit');

      expect(DataRequestLogModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          emailHash: expectedHash,
          action: 'delete',
          status: 'partial',
          details: expect.objectContaining({
            error: 'Brevo Rate Limit',
            brevoDeleted: false,
          }),
        })
      );
    });

    it('handles unexpected database exception by logging failure and re-throwing', async () => {
      (ConsentRecordModel.deleteMany as jest.Mock).mockRejectedValue(new Error('DB connection dropped'));
      (DataRequestLogModel.create as jest.Mock).mockResolvedValue({ _id: 'log5' });

      await expect(deleteUserData(testEmail, { confirm: true })).rejects.toThrow('DB connection dropped');

      expect(DataRequestLogModel.create).toHaveBeenCalledWith({
        emailHash: expectedHash,
        action: 'delete',
        status: 'failed',
        operator: 'cli_admin',
        details: {
          error: 'DB connection dropped',
        },
      });
    });
  });
});
