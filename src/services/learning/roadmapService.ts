import { dbConnect } from '@/lib/dbConnect';
import { LearningResourceModel } from '@/models/LearningResource';
import {
  ROADMAP_STEPS,
  RoadmapStep,
  RoadmapEdition,
  StepId,
  ALL_ROADMAP_SLUGS,
  normalizeEdition,
} from '@/config/roadmap';
import { ILearningResource } from '@/types/learning';

export interface ResolvedResource extends ILearningResource {
  editionNote?: string;
}

export interface ResolvedRoadmapStep {
  step: RoadmapStep;
  resources: ResolvedResource[];
  edition: RoadmapEdition;
}

export interface RoadmapIntegrityResult {
  valid: boolean;
  missingSlugs: string[];
  sponsoredSlugs: string[];
  totalExpected: number;
  totalFound: number;
}

/**
 * Custom domain error for Roadmap integrity violations with structured diagnostic metadata.
 */
export class RoadmapIntegrityError extends Error {
  public readonly code: 'MISSING_RESOURCES' | 'SPONSORED_RESOURCES' | 'MULTIPLE_INTEGRITY_VIOLATIONS';
  public readonly missingSlugs: string[];
  public readonly sponsoredSlugs: string[];

  constructor(
    message: string,
    options: {
      code: 'MISSING_RESOURCES' | 'SPONSORED_RESOURCES' | 'MULTIPLE_INTEGRITY_VIOLATIONS';
      missingSlugs?: string[];
      sponsoredSlugs?: string[];
    }
  ) {
    super(message);
    this.name = 'RoadmapIntegrityError';
    this.code = options.code;
    this.missingSlugs = options.missingSlugs || [];
    this.sponsoredSlugs = options.sponsoredSlugs || [];
    Object.setPrototypeOf(this, RoadmapIntegrityError.prototype);
  }
}

// In-memory cache for resolved roadmaps to eliminate redundant database queries
interface CachedRoadmap {
  data: ResolvedRoadmapStep[];
  timestamp: number;
}

const cacheStore = new Map<RoadmapEdition, CachedRoadmap>();

// Cache TTL configurable via environment, default 60 seconds (aligned with ISR revalidation)
const CACHE_TTL_MS = Number(process.env.ROADMAP_CACHE_TTL_MS) || 60 * 1000;

/**
 * Deep clones resolved roadmap steps to protect the in-memory cache against mutation by callers.
 */
function cloneResolvedSteps(steps: ResolvedRoadmapStep[]): ResolvedRoadmapStep[] {
  return steps.map((s) => ({
    ...s,
    step: { ...s.step },
    resources: s.resources.map((r) => ({ ...r })),
  }));
}

/**
 * Clears the in-memory roadmap cache (useful for tests and on-demand revalidation).
 */
export function clearRoadmapCache(): void {
  cacheStore.clear();
}

/**
 * Internal data-access layer: fetches raw published learning resources for provided slugs.
 * Conforms to Single Responsibility Principle (SRP) and DRY across resolution and diagnostics.
 */
async function fetchRawRoadmapResources(
  slugs: readonly string[]
): Promise<Map<string, ILearningResource & { sponsored?: boolean }>> {
  await dbConnect();

  const rawResources = await LearningResourceModel.find({
    slug: { $in: Array.from(slugs) },
    status: 'published',
  }).lean<Array<ILearningResource & { sponsored?: boolean }>>();

  const resourceMap = new Map<string, ILearningResource & { sponsored?: boolean }>();
  for (const resource of rawResources) {
    resourceMap.set(resource.slug, resource);
  }

  return resourceMap;
}

/**
 * Resolves the 5-step learning roadmap and its referenced learning resources.
 * Validates that all configured resource slugs exist in published state and are non-sponsored.
 *
 * @param {string} [rawEdition='global'] Targeted geographic edition ('global' or 'ph').
 * @throws {RoadmapIntegrityError} If any configured slug is missing from MongoDB or flagged as sponsored.
 * @returns {Promise<ResolvedRoadmapStep[]>} Array of resolved steps with hydrated resources.
 */
export async function getRoadmap(
  rawEdition?: string | null
): Promise<ResolvedRoadmapStep[]> {
  const edition: RoadmapEdition = normalizeEdition(rawEdition);
  const now = Date.now();
  const cached = cacheStore.get(edition);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cloneResolvedSteps(cached.data);
  }

  const resourceMap = await fetchRawRoadmapResources(ALL_ROADMAP_SLUGS);

  // Batched comprehensive validation: collect ALL violations rather than bailing on the first
  const missingSlugs: string[] = [];
  const sponsoredSlugs: string[] = [];

  for (const slug of ALL_ROADMAP_SLUGS) {
    const resource = resourceMap.get(slug);

    if (!resource) {
      missingSlugs.push(slug);
    } else if (resource.sponsored) {
      sponsoredSlugs.push(slug);
    }
  }

  if (missingSlugs.length > 0 || sponsoredSlugs.length > 0) {
    let errorCode: 'MISSING_RESOURCES' | 'SPONSORED_RESOURCES' | 'MULTIPLE_INTEGRITY_VIOLATIONS' =
      'MULTIPLE_INTEGRITY_VIOLATIONS';
    const errorDetails: string[] = [];

    if (missingSlugs.length > 0 && sponsoredSlugs.length === 0) {
      errorCode = 'MISSING_RESOURCES';
      errorDetails.push(`Missing published resource for slug(s): ${missingSlugs.map((s) => `"${s}"`).join(', ')}`);
    } else if (sponsoredSlugs.length > 0 && missingSlugs.length === 0) {
      errorCode = 'SPONSORED_RESOURCES';
      errorDetails.push(`Roadmap cannot contain sponsored resource(s): ${sponsoredSlugs.map((s) => `"${s}"`).join(', ')}`);
    } else {
      errorDetails.push(`Missing slug(s): [${missingSlugs.join(', ')}]`);
      errorDetails.push(`Sponsored slug(s): [${sponsoredSlugs.join(', ')}]`);
    }

    throw new RoadmapIntegrityError(
      `Roadmap Integrity Error: ${errorDetails.join(' | ')}`,
      {
        code: errorCode,
        missingSlugs,
        sponsoredSlugs,
      }
    );
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

  return cloneResolvedSteps(resolvedSteps);
}

/**
 * Retrieves a single resolved roadmap step by its step ID ('understand', 'spot-signs', etc.).
 *
 * @param {string} stepId Target step ID.
 * @param {string} [edition] Optional edition ('global' | 'ph').
 * @returns {Promise<ResolvedRoadmapStep | null>} The resolved step or null if stepId is invalid.
 */
export async function getRoadmapStepById(
  stepId: StepId | string,
  edition?: string | null
): Promise<ResolvedRoadmapStep | null> {
  const steps = await getRoadmap(edition);
  return steps.find((s) => s.step.id === stepId) || null;
}

/**
 * Validates the integrity of all configured roadmap slugs against the database.
 * Does not throw; returns a structured result for CI guardrails and health diagnostics.
 */
export async function validateRoadmapIntegrity(): Promise<RoadmapIntegrityResult> {
  const resourceMap = await fetchRawRoadmapResources(ALL_ROADMAP_SLUGS);

  const missingSlugs: string[] = [];
  const sponsoredSlugs: string[] = [];

  for (const slug of ALL_ROADMAP_SLUGS) {
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
    totalExpected: ALL_ROADMAP_SLUGS.length,
    totalFound: resourceMap.size,
  };
}
