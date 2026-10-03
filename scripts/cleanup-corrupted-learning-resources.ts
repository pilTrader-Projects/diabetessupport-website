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

import { dbConnect } from '../src/lib/dbConnect';
import { LearningResourceModel } from '../src/models/LearningResource';

/**
 * Database hygiene script to purge anomalous resources caused by legacy global search scraping:
 * 1. Purges misattributed Dr. Eric Berg video (embedId: QMsItnMlhuo) wrongly linked to Dr. Jamnadas.
 * 2. Purges playlist pseudo-videos (embedId starting with PL).
 */
export async function cleanupCorruptedLearningResources(): Promise<{
  deletedMisattributed: number;
  deletedPlaylists: number;
}> {
  await dbConnect();

  // 1. Delete misattributed video
  const misattributedResult = await LearningResourceModel.deleteMany({
    embedId: 'QMsItnMlhuo',
    authorityName: { $regex: /Jamnadas/i },
  });

  // 2. Delete playlist pseudo-videos
  const playlistResult = await LearningResourceModel.deleteMany({
    embedId: { $regex: /^PL/ },
  });

  console.log(`[DB Hygiene] Purged ${misattributedResult.deletedCount} misattributed resource(s).`);
  console.log(`[DB Hygiene] Purged ${playlistResult.deletedCount} playlist pseudo-video(s).`);

  return {
    deletedMisattributed: misattributedResult.deletedCount || 0,
    deletedPlaylists: playlistResult.deletedCount || 0,
  };
}

if (require.main === module) {
  cleanupCorruptedLearningResources()
    .then((res) => {
      console.log('Cleanup completed successfully:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Cleanup failed:', err);
      process.exit(1);
    });
}
