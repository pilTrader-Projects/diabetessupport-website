import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Load .env variables if present BEFORE module imports
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && match[1] && !process.env[match[1]]) {
      process.env[match[1]] = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

import { dbConnect } from '../src/lib/dbConnect';
import { ConsentRecordModel } from '../src/models/ConsentRecord';
import { LeadModel } from '../src/models/Lead';
import { AssetDownloadTokenModel } from '../src/models/AssetDownloadToken';
import { ThreadModel } from '../src/models/Thread';
import { ReplyModel } from '../src/models/Reply';
import { DataRequestLogModel } from '../src/models/DataRequestLog';
import { BrevoService } from '../src/services/brevoService';

/**
 * Computes a deterministic SHA-256 hash of a normalized email address.
 * Never stores plain text email in audit logs (RA 10173 & GDPR data minimization).
 */
export function hashEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export interface UserDataExportReport {
  email: string;
  emailHash: string;
  exportedAt: string;
  summary: {
    consentRecordsCount: number;
    leadsCount: number;
    tokensCount: number;
    threadsCount: number;
    repliesCount: number;
    brevoFound: boolean;
  };
  data: {
    consentRecords: any[];
    leads: any[];
    downloadTokens: any[];
    communityThreads: any[];
    communityReplies: any[];
    brevoContact: any | null;
  };
}

export interface UserDataDeleteReport {
  emailHash: string;
  deletedAt: string;
  status: 'success' | 'partial' | 'failed';
  summary: {
    consentRecordsDeleted: number;
    leadsDeleted: number;
    tokensDeleted: number;
    threadsAnonymized: number;
    repliesAnonymized: number;
    brevoDeleted: boolean;
  };
  error?: string;
}

/**
 * Exports all user data across MongoDB collections and Brevo contact storage.
 */
export async function exportUserData(email: string): Promise<UserDataExportReport> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('A valid email address is required for data export.');
  }

  await dbConnect();
  const emailHash = hashEmail(cleanEmail);

  // 1. Gather all MongoDB records
  const [consentRecords, leads, downloadTokens, threads, replies, brevoRes] = await Promise.all([
    ConsentRecordModel.find({ email: cleanEmail }).lean(),
    LeadModel.find({ email: cleanEmail }).lean(),
    AssetDownloadTokenModel.find({ createdBy: cleanEmail }).lean(),
    ThreadModel.find({ authorEmail: cleanEmail }).lean(),
    ReplyModel.find({ authorEmail: cleanEmail }).lean(),
    BrevoService.getContact(cleanEmail),
  ]);

  const report: UserDataExportReport = {
    email: cleanEmail,
    emailHash,
    exportedAt: new Date().toISOString(),
    summary: {
      consentRecordsCount: consentRecords.length,
      leadsCount: leads.length,
      tokensCount: downloadTokens.length,
      threadsCount: threads.length,
      repliesCount: replies.length,
      brevoFound: Boolean(brevoRes.contact),
    },
    data: {
      consentRecords,
      leads,
      downloadTokens,
      communityThreads: threads,
      communityReplies: replies,
      brevoContact: brevoRes.contact || null,
    },
  };

  // 2. Audit Log (Never stores plain text email)
  await DataRequestLogModel.create({
    emailHash,
    action: 'export',
    status: 'success',
    operator: 'cli_admin',
    details: {
      consentRecordsFound: consentRecords.length,
      leadsFound: leads.length,
      tokensFound: downloadTokens.length,
      threadsFound: threads.length,
      repliesFound: replies.length,
      brevoContactFound: Boolean(brevoRes.contact),
    },
  });

  return report;
}

/**
 * Deletes or anonymizes all user data across MongoDB collections and Brevo contact storage.
 * Requires explicit options.confirm = true to execute.
 */
export async function deleteUserData(
  email: string,
  options: { confirm?: boolean } = {}
): Promise<UserDataDeleteReport> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('A valid email address is required for data deletion.');
  }

  if (!options.confirm) {
    throw new Error('Safety Halt: Deletion requires explicit --confirm flag to proceed.');
  }

  await dbConnect();
  const emailHash = hashEmail(cleanEmail);

  try {
    // 1. Cascade Deletion from core lead and consent collections
    const [consentResult, leadResult, tokenResult, threadResult, replyResult, brevoResult] =
      await Promise.all([
        ConsentRecordModel.deleteMany({ email: cleanEmail }),
        LeadModel.deleteMany({ email: cleanEmail }),
        AssetDownloadTokenModel.deleteMany({ createdBy: cleanEmail }),
        // Anonymize community content so thread conversation structure is preserved without personal link
        ThreadModel.updateMany(
          { authorEmail: cleanEmail },
          { $set: { authorEmail: null, notifyOnReply: false, authorAlias: 'Anonymized Member' } }
        ),
        ReplyModel.updateMany(
          { authorEmail: cleanEmail },
          { $set: { authorEmail: null, authorAlias: 'Anonymized Member' } }
        ),
        // Delete from Brevo marketing cloud
        BrevoService.deleteContact(cleanEmail),
      ]);

    const isBrevoSuccess = brevoResult.success && Boolean(brevoResult.deleted || brevoResult.sandbox);
    const overallStatus: 'success' | 'partial' = isBrevoSuccess ? 'success' : 'partial';

    const report: UserDataDeleteReport = {
      emailHash,
      deletedAt: new Date().toISOString(),
      status: overallStatus,
      summary: {
        consentRecordsDeleted: consentResult.deletedCount || 0,
        leadsDeleted: leadResult.deletedCount || 0,
        tokensDeleted: tokenResult.deletedCount || 0,
        threadsAnonymized: threadResult.modifiedCount || 0,
        repliesAnonymized: replyResult.modifiedCount || 0,
        brevoDeleted: isBrevoSuccess,
      },
      ...(isBrevoSuccess ? {} : { error: brevoResult.error }),
    };

    // 2. Audit Log (Never stores plain text email)
    await DataRequestLogModel.create({
      emailHash,
      action: 'delete',
      status: overallStatus,
      operator: 'cli_admin',
      details: {
        consentRecordsDeleted: consentResult.deletedCount || 0,
        leadsDeleted: leadResult.deletedCount || 0,
        tokensDeleted: tokenResult.deletedCount || 0,
        threadsAnonymized: threadResult.modifiedCount || 0,
        repliesAnonymized: replyResult.modifiedCount || 0,
        brevoDeleted: isBrevoSuccess,
        error: brevoResult.error,
      },
    });

    return report;
  } catch (err: any) {
    // Log failure
    await DataRequestLogModel.create({
      emailHash,
      action: 'delete',
      status: 'failed',
      operator: 'cli_admin',
      details: {
        error: err.message,
      },
    }).catch(() => null);

    throw err;
  }
}

// CLI Execution Handler
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  const targetEmail = args[1];
  const isConfirmed = args.includes('--confirm');

  if (!command || !['export', 'delete'].includes(command) || !targetEmail) {
    console.error('Usage:');
    console.error('  npx ts-node scripts/data-request.ts export <email>');
    console.error('  npx ts-node scripts/data-request.ts delete <email> --confirm');
    process.exit(1);
  }

  if (command === 'export') {
    exportUserData(targetEmail)
      .then((report) => {
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
      })
      .catch((err) => {
        console.error('Data Export Error:', err.message);
        process.exit(1);
      });
  } else if (command === 'delete') {
    if (!isConfirmed) {
      console.error('\n⚠️  SAFETY ERROR: Deleting user data is permanent.');
      console.error('To proceed, rerun the command with the explicit --confirm flag:');
      console.error(`  npx ts-node scripts/data-request.ts delete ${targetEmail} --confirm\n`);
      process.exit(1);
    }

    deleteUserData(targetEmail, { confirm: true })
      .then((report) => {
        console.log('\n✅ [Data Deletion Complete]');
        console.log(JSON.stringify(report, null, 2));
        process.exit(0);
      })
      .catch((err) => {
        console.error('Data Deletion Error:', err.message);
        process.exit(1);
      });
  }
}
