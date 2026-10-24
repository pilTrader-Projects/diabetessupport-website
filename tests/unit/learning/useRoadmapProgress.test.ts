import { sanitizeStoredSlugs, BTS_ROADMAP_STORAGE_KEY } from '@/hooks/useRoadmapProgress';
import { ResolvedRoadmapStep } from '@/services/learning/roadmapService';

describe('useRoadmapProgress Hook & Storage Sanitization', () => {
  describe('sanitizeStoredSlugs (Defensive Parser)', () => {
    it('returns an empty array for non-array or null input', () => {
      expect(sanitizeStoredSlugs(null)).toEqual([]);
      expect(sanitizeStoredSlugs(undefined)).toEqual([]);
      expect(sanitizeStoredSlugs({})).toEqual([]);
      expect(sanitizeStoredSlugs(12345)).toEqual([]);
      expect(sanitizeStoredSlugs('string-instead-of-array')).toEqual([]);
      expect(sanitizeStoredSlugs(true)).toEqual([]);
    });

    it('filters out non-string elements, nulls, objects, and empty whitespace strings', () => {
      const dirty = [
        'valid-slug-1',
        null,
        undefined,
        123,
        {},
        [],
        '',
        '   ',
        'valid-slug-2',
        { malicious: 'payload' },
      ];
      expect(sanitizeStoredSlugs(dirty)).toEqual(['valid-slug-1', 'valid-slug-2']);
    });

    it('preserves clean string slugs unchanged', () => {
      const clean = ['jamnadas-fasting-lecture', 'fung-insulin-resistance'];
      expect(sanitizeStoredSlugs(clean)).toEqual(clean);
    });
  });

  describe('Storage key export', () => {
    it('exports standard constant BTS_ROADMAP_STORAGE_KEY', () => {
      expect(BTS_ROADMAP_STORAGE_KEY).toBe('bts_completed_roadmap_resources');
    });
  });
});
