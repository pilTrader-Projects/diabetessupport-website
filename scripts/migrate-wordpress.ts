import { dbConnect } from '../src/lib/dbConnect';
import { PostModel } from '../src/models/Post';
import { CategoryModel } from '../src/models/Category';
import { SITE_CONFIG } from '../src/config/constants';
import { transformWordPressPost, WordPressApiPostPayload } from '../src/services/wordpressMigration';

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
 * Fetches legacy posts from WordPress REST API and imports them into MongoDB.
 *
 * @usecase Migrates blog content from diabetescareph.wordpress.com to the local/production MongoDB database.
 * @param {string} apiUrl WordPress REST API v2 base posts endpoint URL.
 * @dependencies dbConnect, PostModel, CategoryModel, transformWordPressPost.
 * @returns {Promise<MigrationSummary>} Resolved execution summary containing import counters and errors.
 * @throws {Error} Throws connection or fetch error if WordPress REST API is unreachable.
 */
export async function executeWordPressMigration(
  apiUrl: string = SITE_CONFIG.wordpressApiUrl
): Promise<MigrationSummary> {
  console.log(`🚀 Starting WordPress Migration from: ${apiUrl}`);
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
        const transformedData = transformWordPressPost(rawPost, ['General Health'], categoryIdMap);

        // Idempotent upsert by slug
        const existingPost = await PostModel.findOne({ slug: transformedData.slug });
        if (existingPost) {
          summary.skippedPosts++;
          console.log(`⏩ Skipped existing post: "${transformedData.title}" (${transformedData.slug})`);
          continue;
        }

        await PostModel.create(transformedData);
        summary.importedPosts++;
        console.log(`✅ Successfully imported post: "${transformedData.title}"`);
      } catch (postErr: any) {
        const errMsg = `Failed to import post ID ${rawPost.id}: ${postErr.message}`;
        summary.errors.push(errMsg);
        console.error(`❌ ${errMsg}`);
      }
    }

    console.log('\n✨ WordPress Migration Completed!');
    console.log(`📊 Summary: ${summary.importedPosts} imported, ${summary.skippedPosts} skipped, ${summary.errors.length} errors.`);
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
