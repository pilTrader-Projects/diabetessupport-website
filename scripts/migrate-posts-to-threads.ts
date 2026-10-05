import fs from 'fs';
import path from 'path';

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

import mongoose from 'mongoose';
import { dbConnect } from '../src/lib/dbConnect';
import { migratePostsToCommunityThreads } from '../src/services/postToThreadMigration';

/**
 * CLI Migration Script: Legacy Blog Posts to Community Forum Threads
 *
 * @usecase Migrates all non-archived blog posts into Community discussion threads
 *          authored by the Founder & Advocate, with engaging discussion prompts.
 */
async function main() {
  console.log('====================================================');
  console.log('  COMMUNITY MIGRATION: POSTS ➔ COMMUNITY THREADS');
  console.log('====================================================\n');

  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('Connected successfully.\n');

    console.log('Starting migration...');
    const summary = await migratePostsToCommunityThreads({ dryRun: false });

    console.log('\n----------------- Migration Results -----------------');
    console.log(`Total Blog Posts Examined: ${summary.totalFound}`);
    console.log(`Successfully Migrated:     ${summary.migrated}`);
    console.log(`Skipped (Already Exists):   ${summary.skipped}`);
    console.log(`Errors Encountered:        ${summary.errors.length}`);

    if (summary.errors.length > 0) {
      console.log('\nErrors Detail:');
      summary.errors.forEach((err) => {
        console.error(`- [${err.slug}]: ${err.error}`);
      });
    }

    console.log('-----------------------------------------------------\n');
    console.log('Migration completed successfully.');
  } catch (err: any) {
    console.error('Fatal Migration Error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

if (require.main === module) {
  main();
}
