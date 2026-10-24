import {
  ROADMAP_STEPS,
  RoadmapStep,
  ALL_ROADMAP_SLUGS,
  TOTAL_ROADMAP_STEPS,
  normalizeEdition,
  getRoadmapStepConfig,
} from '@/config/roadmap';
import {
  getRoadmap,
  getRoadmapStepById,
  clearRoadmapCache,
  validateRoadmapIntegrity,
  RoadmapIntegrityError,
} from '@/services/learning/roadmapService';
import { LearningResourceModel } from '@/models/LearningResource';
import { dbConnect } from '@/lib/dbConnect';

// Mock database and model for unit isolation
jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models/LearningResource', () => ({
  LearningResourceModel: {
    find: jest.fn(),
  },
}));

describe('P2-01: Roadmap Definition & Integrity Service (roadmapService.ts)', () => {
  const mockDbResources = [
    {
      _id: 'r1',
      title: 'What is Insulin?',
      slug: 'what-is-insulin-c4ruxp',
      authorityName: 'Dr. Pradip Jamnadas, MD',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r2',
      title: 'What is Insulin Resistance? | Jason Fung',
      slug: 'what-is-insulin-resistance-jason-fung-r0d5lj',
      authorityName: 'Dr. Jason Fung',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r3',
      title: 'Your blood sugar can look “normal” while trouble is already brewing.',
      slug: 'your-blood-sugar-can-look-normal-while-trouble-is-already-brewing-xbrfv_',
      authorityName: 'Dr. Ken D. Berry, MD',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r4',
      title: '163: What Your Glucose Monitor Is Missing',
      slug: '163-what-your-glucose-monitor-is-missing-9mtnpd',
      authorityName: 'Dr. Ben Bikman, PhD',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r5',
      title: 'What causes Insulin Resistance? | Insulin resistance | Jason Fung',
      slug: 'what-causes-insulin-resistance-insulin-resistance-jason-fung-crzpdh',
      authorityName: 'Dr. Jason Fung',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r6',
      title: '156: The Most Dangerous Fat in Your Body',
      slug: '156-the-most-dangerous-fat-in-your-body-mkgnws',
      authorityName: 'Dr. Ben Bikman, PhD',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r7',
      title: 'Dr. Ben Bikman: How To Reverse Insulin Resistance Through Diet, Exercise, & Sleep',
      slug: 'dr-ben-bikman-how-to-reverse-insulin-resistance-through-diet-exercise-sleep-gmyosh',
      authorityName: 'Dr. Ben Bikman, PhD',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r8',
      title: 'How to Lower Blood Sugar Without Cutting Carbs - The Diabetes Code Clinic part 6/6',
      slug: 'how-to-lower-blood-sugar-without-cutting-carbs-the-diabetes-code-clinic-part-66-v2kkgm',
      authorityName: 'Dr. Jason Fung',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r9',
      title: 'Fasting and medication- what precautions to take #fasting',
      slug: 'fasting-and-medication-what-precautions-to-take-fasting-atucqo',
      authorityName: 'Dr. Jason Fung',
      status: 'published',
      sponsored: false,
    },
    {
      _id: 'r10',
      title: 'Reversing Diabetes - The Roles Medication and Diet Play',
      slug: 'reversing-diabetes-the-roles-medication-and-diet-play-mwnygx',
      authorityName: 'Dr. Pradip Jamnadas, MD',
      status: 'published',
      sponsored: false,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    clearRoadmapCache();
  });

  describe('ROADMAP_STEPS Configuration & Memoized Constants', () => {
    it('defines exactly 5 ordered learning roadmap steps and matches TOTAL_ROADMAP_STEPS', () => {
      expect(ROADMAP_STEPS).toHaveLength(5);
      expect(TOTAL_ROADMAP_STEPS).toBe(5);
      expect(ROADMAP_STEPS.map((s) => s.order)).toEqual([1, 2, 3, 4, 5]);
    });

    it('each step contains a unique id, title, goal, and at least 2 resourceSlugs', () => {
      const ids = new Set();
      for (const step of ROADMAP_STEPS) {
        expect(step.id).toBeDefined();
        expect(ids.has(step.id)).toBe(false);
        ids.add(step.id);

        expect(step.title).toBeTruthy();
        expect(step.goal).toBeTruthy();
        expect(step.resourceSlugs.length).toBeGreaterThanOrEqual(2);
      }
    });

    it('Step 5 includes an explicit clinical safety note', () => {
      const step5 = ROADMAP_STEPS.find((s) => s.order === 5);
      expect(step5).toBeDefined();
      expect(step5?.safetyNote).toBeDefined();
      expect(step5?.safetyNote).toContain('consult your prescribing physician');
    });

    it('ALL_ROADMAP_SLUGS contains all 10 unique slugs and is immutable (frozen)', () => {
      expect(ALL_ROADMAP_SLUGS).toHaveLength(10);
      expect(Object.isFrozen(ALL_ROADMAP_SLUGS)).toBe(true);
    });

    it('normalizeEdition handles casing, whitespace, and falls back to global', () => {
      expect(normalizeEdition('ph')).toBe('ph');
      expect(normalizeEdition('PH')).toBe('ph');
      expect(normalizeEdition('  ph  ')).toBe('ph');
      expect(normalizeEdition('global')).toBe('global');
      expect(normalizeEdition('GLOBAL')).toBe('global');
      expect(normalizeEdition('invalid')).toBe('global');
      expect(normalizeEdition(null)).toBe('global');
      expect(normalizeEdition(undefined)).toBe('global');
    });

    it('getRoadmapStepConfig finds step by id or number', () => {
      const byId = getRoadmapStepConfig('understand');
      expect(byId?.order).toBe(1);

      const byNum = getRoadmapStepConfig(5);
      expect(byNum?.id).toBe('stay-safe');

      const nonExistent = getRoadmapStepConfig('unknown-step');
      expect(nonExistent).toBeUndefined();
    });
  });

  describe('getRoadmap() Service Execution', () => {
    it('resolves all 5 steps with matching populated learning resources', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      const roadmap = await getRoadmap('global');

      expect(dbConnect).toHaveBeenCalled();
      expect(roadmap).toHaveLength(5);
      expect(roadmap[0].step.order).toBe(1);
      expect(roadmap[0].resources).toHaveLength(2);
      expect(roadmap[0].resources[0].slug).toBe('what-is-insulin-c4ruxp');
      expect(roadmap[0].resources[1].slug).toBe('what-is-insulin-resistance-jason-fung-r0d5lj');
    });

    it('caches resolved roadmap so subsequent calls do not repeat database query', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      await getRoadmap('global');
      await getRoadmap('global');

      expect(LearningResourceModel.find).toHaveBeenCalledTimes(1);
    });

    it('guarantees cache immutability (mutating returned value does not mutate cache)', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      const firstCall = await getRoadmap('global');
      // Mutate returned object
      firstCall[0].step.title = 'MUTATED TITLE';
      firstCall[0].resources[0].title = 'MUTATED RESOURCE TITLE';

      // Subsequent call from cache should remain pristine
      const secondCall = await getRoadmap('global');
      expect(secondCall[0].step.title).toBe('Understand');
      expect(secondCall[0].resources[0].title).toBe('What is Insulin?');
    });

    it('applies edition-specific notes when edition="ph"', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      const roadmapPh = await getRoadmap('PH');
      expect(roadmapPh).toBeDefined();
      expect(roadmapPh[0].edition).toBe('ph');
      expect(roadmapPh[0].resources[0].editionNote).toContain('Mahalagang panimula');
    });

    it('MANDATORY FAIL-SAFE: throws RoadmapIntegrityError with code MISSING_RESOURCES when a slug is missing', async () => {
      const incompleteResources = mockDbResources.slice(0, 9);
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(incompleteResources),
      });

      try {
        await getRoadmap('global');
        fail('Should have thrown RoadmapIntegrityError');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(RoadmapIntegrityError);
        const integrityErr = err as RoadmapIntegrityError;
        expect(integrityErr.code).toBe('MISSING_RESOURCES');
        expect(integrityErr.missingSlugs).toContain('reversing-diabetes-the-roles-medication-and-diet-play-mwnygx');
      }
    });

    it('MANDATORY INTEGRITY: throws RoadmapIntegrityError with code SPONSORED_RESOURCES when a resource is sponsored', async () => {
      const sponsoredResources = mockDbResources.map((r, idx) =>
        idx === 0 ? { ...r, sponsored: true } : r
      );
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(sponsoredResources),
      });

      try {
        await getRoadmap('global');
        fail('Should have thrown RoadmapIntegrityError');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(RoadmapIntegrityError);
        const integrityErr = err as RoadmapIntegrityError;
        expect(integrityErr.code).toBe('SPONSORED_RESOURCES');
        expect(integrityErr.sponsoredSlugs).toContain('what-is-insulin-c4ruxp');
      }
    });

    it('throws MULTIPLE_INTEGRITY_VIOLATIONS when both missing and sponsored resources exist simultaneously', async () => {
      // 1 sponsored, 1 missing
      const mixedResources = [
        { ...mockDbResources[0], sponsored: true },
        ...mockDbResources.slice(2), // mockDbResources[1] omitted
      ];
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mixedResources),
      });

      try {
        await getRoadmap('global');
        fail('Should have thrown RoadmapIntegrityError');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(RoadmapIntegrityError);
        const integrityErr = err as RoadmapIntegrityError;
        expect(integrityErr.code).toBe('MULTIPLE_INTEGRITY_VIOLATIONS');
        expect(integrityErr.sponsoredSlugs).toContain('what-is-insulin-c4ruxp');
        expect(integrityErr.missingSlugs).toContain('what-is-insulin-resistance-jason-fung-r0d5lj');
      }
    });
  });

  describe('getRoadmapStepById() Domain Method', () => {
    it('returns the requested step when stepId is valid', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      const step = await getRoadmapStepById('stay-safe', 'ph');
      expect(step).not.toBeNull();
      expect(step?.step.id).toBe('stay-safe');
      expect(step?.edition).toBe('ph');
      expect(step?.resources).toHaveLength(2);
    });

    it('returns null when stepId is not recognized', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      const step = await getRoadmapStepById('non-existent-step');
      expect(step).toBeNull();
    });
  });

  describe('validateRoadmapIntegrity() Helper', () => {
    it('returns valid=true when all resources exist and are non-sponsored', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockDbResources),
      });

      const result = await validateRoadmapIntegrity();
      expect(result.valid).toBe(true);
      expect(result.missingSlugs).toHaveLength(0);
      expect(result.sponsoredSlugs).toHaveLength(0);
      expect(result.totalExpected).toBe(10);
      expect(result.totalFound).toBe(10);
    });

    it('returns missing and sponsored slugs when integrity check fails', async () => {
      (LearningResourceModel.find as jest.Mock).mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { ...mockDbResources[0], sponsored: true },
          // mockDbResources[1] missing
        ]),
      });

      const result = await validateRoadmapIntegrity();
      expect(result.valid).toBe(false);
      expect(result.missingSlugs.length).toBeGreaterThan(0);
      expect(result.sponsoredSlugs).toContain('what-is-insulin-c4ruxp');
    });
  });
});

