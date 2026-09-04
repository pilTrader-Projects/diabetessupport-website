const fs = require('fs');
const path = require('path');

/**
 * Executes system environment and critical asset sanity checks before code delivery.
 *
 * @usecase Verifies all mandatory documentation, standards, configuration files, environment templates, docker compose file, and core application files exist.
 * @param None Reads process.cwd() file system tree.
 * @dependencies fs, path modules.
 * @returns {Promise<void>} Resolves when all required file paths exist.
 * @throws {Error} Throws error with file path details if any required file is missing.
 */
async function runSanityCheck() {
    console.log("🚀 Starting Environment Sanity Check...");

    const requiredPaths = [
        'docs/standards.md',
        'docs/guardrails.md',
        '.agent/personas.md',
        'ROADMAP.md',
        '.env.example',
        'docker-compose.yml',
        'src/config/constants.ts',
        'src/lib/dbConnect.ts',
        'src/types/blog.ts',
        'src/models/Post.ts',
        'src/models/Category.ts',
        'src/models/ApiKey.ts',
        'src/models/LandingPage.ts',
        'src/services/wordpressMigration.ts',
        'scripts/migrate-wordpress.ts',
        'src/app/api/v1/migration/route.ts',
        'src/app/api/v1/posts/route.ts',
        'src/app/api/v1/subscribe/route.ts',
        'src/app/api/v1/admin/login/route.ts',
        'src/app/api/v1/landing-pages/route.ts',
        'src/lib/auth.ts',
        'src/lib/adminAuth.ts',
        'src/app/sitemap.xml/route.ts',
        'src/app/feed.xml/route.ts',
        'src/components/ExtensionGuard.tsx',
        'src/components/Header.tsx',
        'src/components/KitOptInForm.tsx',
        'src/components/LeadMagnetCard.tsx',
        'src/components/KitScriptEmbed.tsx',
        'src/app/subscribe/page.tsx',
        'src/app/guides/cheatsheet/page.tsx',
        'src/app/admin/page.tsx',
        'src/app/admin/login/page.tsx',
        'src/app/admin/landing-pages/page.tsx',
        'src/app/admin/posts/page.tsx',
        'src/app/layout.tsx',
        'src/app/page.tsx',
        'src/app/globals.css'
    ];

    console.log("Checking required files...");
    for (const relPath of requiredPaths) {
        const fullPath = path.join(process.cwd(), relPath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`❌ Missing required file: ${relPath}`);
        }
        console.log(`✅ Verified: ${relPath}`);
    }

    console.log("\n✨ Sanity check passed! The environment is ready.");
}

runSanityCheck().catch((err: Error) => {
    console.error(err.message);
    process.exit(1);
});
