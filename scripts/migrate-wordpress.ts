import fs from 'fs';
import path from 'path';
import { dbConnect } from '../src/lib/dbConnect';
import { PostModel } from '../src/models/Post';
import { CategoryModel } from '../src/models/Category';
import { SITE_CONFIG } from '../src/config/constants';
import { transformWordPressPost, WordPressApiPostPayload } from '../src/services/wordpressMigration';

// Load .env variables if present
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

/**
 * Interface representing summary results of the WordPress migration process.
 * @usecase Strongly types output reports for migration runs.
 */
export interface MigrationSummary {
  totalFetched: number;
  importedPosts: number;
  skippedPosts: number;
  categoriesCreated: number;
  errors: string[];
}

/**
 * Downloads a remote image asset from WordPress and saves it to local public/uploads/wp-media/ directory.
 *
 * @usecase Decouples image assets from WordPress CDN so images persist after WordPress site shutdown.
 * @param {string} imageUrl Remote WordPress image URL.
 * @dependencies fs, path modules, fetch API.
 * @returns {Promise<string>} Local public relative path (/uploads/wp-media/filename.jpg).
 */
async function downloadMediaFile(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) return imageUrl;

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'wp-media');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const urlPath = new URL(imageUrl).pathname;
    const baseName = path.basename(urlPath) || `img_${Date.now()}.jpg`;
    const cleanName = baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const localFilePath = path.join(uploadDir, cleanName);

    if (fs.existsSync(localFilePath)) {
      return `/uploads/wp-media/${cleanName}`;
    }

    const res = await fetch(imageUrl);
    if (!res.ok) return imageUrl;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(localFilePath, buffer);

    console.log(`🖼️ Downloaded media asset: ${cleanName}`);
    return `/uploads/wp-media/${cleanName}`;
  } catch (err) {
    console.warn(`⚠️ Failed to download media ${imageUrl}, keeping remote URL as fallback.`);
    return imageUrl;
  }
}

/**
 * Fetches legacy posts from WordPress REST API and imports them into MongoDB.
 *
 * @usecase Migrates blog content & media from diabetescareph.wordpress.com to local MongoDB database.
 * @param {string} apiUrl WordPress REST API v2 base posts endpoint URL.
 * @dependencies dbConnect, PostModel, CategoryModel, transformWordPressPost, downloadMediaFile.
 * @returns {Promise<MigrationSummary>} Resolved execution summary containing import counters and errors.
 */
export async function executeWordPressMigration(
  apiUrl: string = process.env.WORDPRESS_API_URL || SITE_CONFIG.wordpressApiUrl
): Promise<MigrationSummary> {
  console.log(`🚀 Starting Self-Hosted WordPress Migration from: ${apiUrl}`);
  await dbConnect();

  const summary: MigrationSummary = {
    totalFetched: 0,
    importedPosts: 0,
    skippedPosts: 0,
    categoriesCreated: 0,
    errors: [],
  };

  try {
    const response = await fetch(`${apiUrl}/posts?per_page=100`);
    if (!response.ok) {
      throw new Error(`WordPress REST API request failed with status ${response.status}: ${response.statusText}`);
    }

    const rawPosts: WordPressApiPostPayload[] = await response.json();
    summary.totalFetched = rawPosts.length;
    console.log(`📦 Fetched ${rawPosts.length} posts from WordPress REST API.`);

    // Pre-seed default General category if missing
    let defaultCat = await CategoryModel.findOne({ slug: 'general' });
    if (!defaultCat) {
      defaultCat = await CategoryModel.create({
        name: 'General Health',
        slug: 'general',
        description: 'General health, diabetes management, and wellness guides.',
      });
      summary.categoriesCreated++;
    }

    const categoryIdMap = new Map<string, string>();
    categoryIdMap.set('General Health', defaultCat._id.toString());
    categoryIdMap.set('General', defaultCat._id.toString());

    for (const rawPost of rawPosts) {
      try {
        const mediaMap = new Map<string, string>();
        
        // Download featured image locally
        const rawFeatured = rawPost.jetpack_featured_media_url || rawPost.featured_media_url;
        if (rawFeatured) {
          const localFeaturedPath = await downloadMediaFile(rawFeatured);
          mediaMap.set(rawFeatured, localFeaturedPath);
        }

        // Scan and download inline <img> tags in post HTML content
        const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
        let match;
        while ((match = imgRegex.exec(rawPost.content?.rendered || '')) !== null) {
          const remoteImgUrl = match[1];
          if (remoteImgUrl && !mediaMap.has(remoteImgUrl)) {
            const localImgPath = await downloadMediaFile(remoteImgUrl);
            mediaMap.set(remoteImgUrl, localImgPath);
          }
        }

        const transformedData = transformWordPressPost(rawPost, ['General Health'], categoryIdMap, mediaMap);

        // Update existing or create post
        const existingPost = await PostModel.findOne({ slug: transformedData.slug });
        if (existingPost) {
          await PostModel.updateOne({ _id: existingPost._id }, { $set: transformedData });
          summary.skippedPosts++;
          console.log(`🔄 Updated existing post with local media assets: "${transformedData.title}"`);
          continue;
        }

        await PostModel.create(transformedData);
        summary.importedPosts++;
        console.log(`✅ Successfully imported post with local media assets: "${transformedData.title}"`);
      } catch (postErr: any) {
        const errMsg = `Failed to import post ID ${rawPost.id}: ${postErr.message}`;
        summary.errors.push(errMsg);
        console.error(`❌ ${errMsg}`);
      }
    }

    console.log('\n✨ Self-Hosted WordPress Migration Completed!');
    console.log(`📊 Summary: ${summary.importedPosts} created, ${summary.skippedPosts} updated with local media, ${summary.errors.length} errors.`);
    return summary;
  } catch (err: any) {
    console.error(`❌ Migration process error: ${err.message}`);
    summary.errors.push(err.message);
    return summary;
  }
}

// CLI Execution block
if (require.main === module) {
  executeWordPressMigration()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
