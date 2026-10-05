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
import { PostModel } from '../src/models/Post';

export const TAG_REPLACEMENTS: Record<string, string> = {
  'loose weight': 'Weight Management',
  'loose-weight': 'Weight Management',
  'reverse type 2 diabetes': 'Type 2 Remission',
  'reverse diabetes': 'Type 2 Remission',
  'reverse insulin resistance': 'Insulin Sensitivity',
  'heal diabetes': 'Metabolic Health',
  'cure diabetes': 'Metabolic Health',
};

/**
 * Normalizes and sanitizes an array of tags to eliminate typos and unhedged cure claims.
 *
 * @param {string[]} tags List of original tag strings.
 * @returns {string[]} Sanitized and deduplicated list of tags.
 */
export function sanitizeTagsList(tags: string[]): string[] {
  if (!Array.isArray(tags)) return [];

  const sanitized = tags.map((tag) => {
    const cleanLower = tag.trim().toLowerCase();
    if (TAG_REPLACEMENTS[cleanLower]) {
      return TAG_REPLACEMENTS[cleanLower];
    }
    return tag.trim();
  });

  return Array.from(new Set(sanitized.filter(Boolean)));
}

/**
 * Runs MongoDB tag sanitization across the Post collection.
 */
export async function sanitizeDatabaseTags(): Promise<{
  scanned: number;
  updated: number;
}> {
  await dbConnect();

  const posts = await PostModel.find({});
  let updatedCount = 0;

  for (const post of posts) {
    if (Array.isArray(post.tags) && post.tags.length > 0) {
      const cleaned = sanitizeTagsList(post.tags);
      const hasChanged = JSON.stringify(cleaned) !== JSON.stringify(post.tags);

      if (hasChanged) {
        post.tags = cleaned;
        await post.save();
        updatedCount++;
      }
    }
  }

  return { scanned: posts.length, updated: updatedCount };
}

async function main() {
  console.log('--- MongoDB Tag Sanitization Script ---');
  try {
    const results = await sanitizeDatabaseTags();
    console.log(`Scanned ${results.scanned} posts. Updated ${results.updated} posts with clean tags.`);
  } catch (err) {
    console.error('Tag Sanitization Failed:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main();
}
