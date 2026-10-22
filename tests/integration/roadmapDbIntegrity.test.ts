import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import { ROADMAP_STEPS, ALL_ROADMAP_SLUGS } from '@/config/roadmap';
import {
  getRoadmap,
  getRoadmapStepById,
  validateRoadmapIntegrity,
  clearRoadmapCache,
} from '@/services/learning/roadmapService';

describe('P2-01 Live Database Verification: Roadmap Slugs Integrity', () => {
  const hasMongoUri = Boolean(process.env.MONGODB_URI);

  beforeEach(() => {
    clearRoadmapCache();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  // If MONGODB_URI is available in environment, run against live database
  (hasMongoUri ? describe : describe.skip)('Live MongoDB Cluster Execution', () => {
    it('verifies that all 10 configured roadmap resource slugs physically exist in MongoDB in published state', async () => {
      await dbConnect();

      expect(ALL_ROADMAP_SLUGS).toHaveLength(10);

      const foundResources = await LearningResourceModel.find({
        slug: { $in: Array.from(ALL_ROADMAP_SLUGS) },
        status: 'published',
      }).lean();

      const foundMap = new Map(foundResources.map((r) => [r.slug, r]));

      for (const slug of ALL_ROADMAP_SLUGS) {
        const item = foundMap.get(slug);
        expect(item).toBeDefined();
        expect(item?.slug).toBe(slug);
        expect(item?.status).toBe('published');
      }

      expect(foundResources).toHaveLength(10);
    }, 30000);

    it('verifies validateRoadmapIntegrity() reports 100% health against live database', async () => {
      const integrity = await validateRoadmapIntegrity();
      expect(integrity.valid).toBe(true);
      expect(integrity.missingSlugs).toHaveLength(0);
      expect(integrity.sponsoredSlugs).toHaveLength(0);
      expect(integrity.totalExpected).toBe(10);
      expect(integrity.totalFound).toBe(10);
    }, 30000);

    it('verifies getRoadmap() resolves all 5 steps with valid titles and localized notes for both global and ph editions', async () => {
      const globalRoadmap = await getRoadmap('global');
      expect(globalRoadmap).toHaveLength(5);

      const phRoadmap = await getRoadmap('ph');
      expect(phRoadmap).toHaveLength(5);

      for (let i = 0; i < 5; i++) {
        expect(globalRoadmap[i].step.order).toBe(i + 1);
        expect(globalRoadmap[i].resources.length).toBeGreaterThanOrEqual(2);
        expect(phRoadmap[i].step.order).toBe(i + 1);
        expect(phRoadmap[i].resources.length).toBeGreaterThanOrEqual(2);

        // Check that edition notes are populated
        const phNote = phRoadmap[i].resources[0].editionNote;
        expect(phNote).toBeTruthy();
      }
    }, 30000);

    it('verifies getRoadmapStepById("stay-safe") resolves step 5 with clinical safety note', async () => {
      const step5 = await getRoadmapStepById('stay-safe', 'ph');
      expect(step5).not.toBeNull();
      expect(step5?.step.id).toBe('stay-safe');
      expect(step5?.step.safetyNote).toBeDefined();
      expect(step5?.step.safetyNote).toContain('consult your prescribing physician');
      expect(step5?.resources).toHaveLength(2);
    }, 30000);
  });
});

