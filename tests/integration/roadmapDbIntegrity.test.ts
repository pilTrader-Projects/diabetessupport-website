import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import { ROADMAP_STEPS } from '@/config/roadmap';

describe('P2-01 Live Database Verification: Roadmap Slugs Integrity', () => {
  const hasMongoUri = Boolean(process.env.MONGODB_URI);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // If MONGODB_URI is available in environment, run against live database
  (hasMongoUri ? it : it.skip)(
    'verifies that all 10 configured roadmap resource slugs physically exist in MongoDB in published state',
    async () => {
      await dbConnect();

      const allSlugs = ROADMAP_STEPS.flatMap((step) => step.resourceSlugs);
      expect(allSlugs).toHaveLength(10);

      const foundResources = await LearningResourceModel.find({
        slug: { $in: allSlugs },
        status: 'published',
      }).lean();

      const foundMap = new Map(foundResources.map((r) => [r.slug, r]));

      for (const slug of allSlugs) {
        const item = foundMap.get(slug);
        expect(item).toBeDefined();
        expect(item?.slug).toBe(slug);
        expect(item?.status).toBe('published');
      }

      expect(foundResources).toHaveLength(10);
    },
    30000
  );
});
