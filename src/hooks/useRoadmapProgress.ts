'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ResolvedRoadmapStep } from '@/services/learning/roadmapService';

export const BTS_ROADMAP_STORAGE_KEY = 'bts_completed_roadmap_resources';

/**
 * Safely validates and sanitizes any parsed localStorage payload into a pure string array.
 * Defends against malformed JSON, corrupted storage, or type tampering.
 */
export function sanitizeStoredSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

export interface UseRoadmapProgressReturn {
  completedSlugs: string[];
  isResourceCompleted: (slug: string) => boolean;
  toggleResourceCompleted: (slug: string) => void;
  totalResources: number;
  totalCompleted: number;
  progressPercentage: number;
}

/**
 * Clean architectural hook decoupling localStorage persistence, error boundaries,
 * and curriculum completion mathematics from UI rendering components.
 */
export function useRoadmapProgress(steps: ResolvedRoadmapStep[]): UseRoadmapProgressReturn {
  const [completedSlugs, setCompletedSlugs] = useState<string[]>([]);

  // Load and defensively sanitize completed resources from localStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const stored = window.localStorage.getItem(BTS_ROADMAP_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedSlugs(sanitizeStoredSlugs(parsed));
      }
    } catch {
      // Graceful fallback for SSR, blocked third-party cookies, or quota limits
    }
  }, []);

  const isResourceCompleted = useCallback(
    (slug: string): boolean => {
      return completedSlugs.includes(slug);
    },
    [completedSlugs]
  );

  const toggleResourceCompleted = useCallback((slug: string) => {
    if (!slug || typeof slug !== 'string') return;
    setCompletedSlugs((prev) => {
      const isAlreadyDone = prev.includes(slug);
      const next = isAlreadyDone ? prev.filter((s) => s !== slug) : [...prev, slug];
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(BTS_ROADMAP_STORAGE_KEY, JSON.stringify(next));
        }
      } catch {
        // Handle Safari private browsing quota errors or security exceptions
      }
      return next;
    });
  }, []);

  // Memoized curriculum calculations to eliminate redundant array allocations
  const totalResources = useMemo(() => {
    if (!Array.isArray(steps)) return 0;
    return steps.reduce((acc, curr) => acc + (Array.isArray(curr?.resources) ? curr.resources.length : 0), 0);
  }, [steps]);

  const totalCompleted = useMemo(() => {
    if (!Array.isArray(steps) || completedSlugs.length === 0) return 0;
    return completedSlugs.filter((slug) =>
      steps.some((s) => Array.isArray(s?.resources) && s.resources.some((r) => r?.slug === slug))
    ).length;
  }, [steps, completedSlugs]);

  const progressPercentage = useMemo(() => {
    if (totalResources === 0) return 0;
    return Math.min(100, Math.max(0, Math.round((totalCompleted / totalResources) * 100)));
  }, [totalCompleted, totalResources]);

  return {
    completedSlugs,
    isResourceCompleted,
    toggleResourceCompleted,
    totalResources,
    totalCompleted,
    progressPercentage,
  };
}
