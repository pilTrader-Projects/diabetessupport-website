const fs = require('fs');
const path = require('path');

async function runSanityCheck() {
    console.log("🚀 Starting Environment Sanity Check...");

    const requiredPaths = [
        'docs/standards.md',
        'docs/guardrails.md',
        '.agent/personas.md',
        'ROADMAP.md',
        'src/config/constants.ts',
        'src/lib/dbConnect.ts',
        'src/types/blog.ts',
        'src/models/Post.ts',
        'src/models/Category.ts',
        'src/models/ApiKey.ts',
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
