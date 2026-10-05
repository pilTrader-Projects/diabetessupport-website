import fs from 'fs';
import path from 'path';

// Load .env variables before database connection
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

import mongoose from 'mongoose';
import { dbConnect } from '../src/lib/dbConnect';
import { migratePostsToThreads } from '../src/services/postToThreadMigration';

/**
 * CLI Runner: Migrates WordPress posts from posts collection into threads collection with Founder attribution.
 *
 * Usage:
 *   npx ts-node scripts/migrate-posts-to-threads.ts
 *   npx ts-node scripts/migrate-posts-to-threads.ts --dry-run
 */
async function run() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`Starting Legacy Post to Community Thread Migration (Dry Run: ${isDryRun})...`);

  await dbConnect();

  const result = await migratePostsToThreads({ dryRun: isDryRun });

  console.log('--------------------------------------------------');
  console.log(`Total Published Posts Processed: ${result.totalProcessed}`);
  console.log(`New Threads Created:             ${result.migratedCount}`);
  console.log(`Already Existing Threads:        ${result.skippedCount}`);
  console.log(`Posts Archived:                  ${result.archivedPostsCount}`);
  if (result.errors.length > 0) {
    console.warn(`Errors encountered (${result.errors.length}):`);
    result.errors.forEach((err) => console.warn(` - ${err}`));
  }
  console.log('--------------------------------------------------');

  await mongoose.disconnect();
  console.log('Database disconnected. Migration complete.');
}

run().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
