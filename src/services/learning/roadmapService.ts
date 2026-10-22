import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import { ROADMAP_STEPS, RoadmapStep } from '@/config/roadmap';
import { ILearningResource } from '@/types/learning';

export interface ResolvedResource extends ILearningResource {
  editionNote?: string;
}

export interface ResolvedRoadmapStep {
  step: RoadmapStep;
  resources: ResolvedResource[];
  edition: 'global' | 'ph';
}

export interface RoadmapIntegrityResult {
  valid: boolean;
  missingSlugs: string[];
  sponsoredSlugs: string[];
  totalExpected: number;
  totalFound: number;
}

// In-memory cache for resolved roadmaps to avoid redundant database roundtrips
interface CachedRoadmap {
  data: ResolvedRoadmapStep[];
  timestamp: number;
}

const cacheStore = new Map<'global' | 'ph', CachedRoadmap>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds (aligned with ISR revalidation)

/**
 * Clears the in-memory roadmap cache (useful for tests and on-demand revalidation).
 */
export function clearRoadmapCache(): void {
  cacheStore.clear();
}

/**
 * Resolves the 5-step learning roadmap and its referenced learning resources.
 * Validates that all configured resource slugs exist in published state and are non-sponsored.
 *
 * @param {'global' | 'ph'} [edition='global'] Targeted geographic edition for localized curator notes.
 * @throws {Error} If any configured slug is missing from MongoDB or flagged as sponsored.
 * @returns {Promise<ResolvedRoadmapStep[]>} Array of resolved steps with hydrated resources.
 */
export async function getRoadmap(
  edition: 'global' | 'ph' = 'global'
): Promise<ResolvedRoadmapStep[]> {
  const cached = cacheStore.get(edition);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  await dbConnect();

  // Collect all unique slugs required across all steps
  const allSlugs = Array.from(
    new Set(ROADMAP_STEPS.flatMap((step) => step.resourceSlugs))
  );

  // Fetch all published matching learning resources
  const rawResources = await LearningResourceModel.find({
    slug: { $in: allSlugs },
    status: 'published',
  }).lean<Array<ILearningResource & { sponsored?: boolean }>>();

  const resourceMap = new Map<string, ILearningResource & { sponsored?: boolean }>();
  for (const resource of rawResources) {
    resourceMap.set(resource.slug, resource);
  }

  // Validate integrity: every required slug must exist and cannot be sponsored
  for (const step of ROADMAP_STEPS) {
    for (const slug of step.resourceSlugs) {
      const resource = resourceMap.get(slug);

      if (!resource) {
        throw new Error(
          `Roadmap Integrity Error: Missing published resource for slug "${slug}" in step "${step.title}"`
        );
      }

      if (resource.sponsored) {
        throw new Error(
          `Roadmap Integrity Error: Roadmap cannot contain sponsored resource "${slug}" in step "${step.title}"`
        );
      }
    }
  }

  // Construct resolved roadmap steps preserving configured order
  const resolvedSteps: ResolvedRoadmapStep[] = ROADMAP_STEPS.map((step) => {
    const resources: ResolvedResource[] = step.resourceSlugs.map((slug) => {
      const baseResource = resourceMap.get(slug)!;
      const note = step.editionNotes?.[edition]?.[slug];

      return {
        ...baseResource,
        editionNote: note,
      };
    });

    return {
      step,
      resources,
      edition,
    };
  });

  // Store in cache
  cacheStore.set(edition, {
    data: resolvedSteps,
    timestamp: now,
  });

  return resolvedSteps;
}

/**
 * Validates the integrity of all configured roadmap slugs against the database.
 * Does not throw; returns a structured result for CI guardrails and health diagnostics.
 */
export async function validateRoadmapIntegrity(): Promise<RoadmapIntegrityResult> {
  await dbConnect();

  const allSlugs = Array.from(
    new Set(ROADMAP_STEPS.flatMap((step) => step.resourceSlugs))
  );

  const rawResources = await LearningResourceModel.find({
    slug: { $in: allSlugs },
    status: 'published',
  }).lean<Array<ILearningResource & { sponsored?: boolean }>>();

  const resourceMap = new Map<string, ILearningResource & { sponsored?: boolean }>();
  for (const resource of rawResources) {
    resourceMap.set(resource.slug, resource);
  }

  const missingSlugs: string[] = [];
  const sponsoredSlugs: string[] = [];

  for (const slug of allSlugs) {
    const resource = resourceMap.get(slug);
    if (!resource) {
      missingSlugs.push(slug);
    } else if (resource.sponsored) {
      sponsoredSlugs.push(slug);
    }
  }

  return {
    valid: missingSlugs.length === 0 && sponsoredSlugs.length === 0,
    missingSlugs,
    sponsoredSlugs,
    totalExpected: allSlugs.length,
    totalFound: rawResources.length,
  };
}
