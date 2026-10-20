import fs from 'fs';
import path from 'path';
import {
  parseFrontMatter,
  getLegalDocument,
  getAllLegalSlugs,
  formatEffectiveDate,
  LEGAL_CONTENT_DIR,
} from '@/lib/legalContent';

describe('legalContent loader (P0-01)', () => {
  describe('parseFrontMatter', () => {
    it('splits front matter from body and keeps colons inside values', () => {
      const raw = '---\ntitle: A: B\nversion: 1.0\nreviewedBy:\n---\n\nBody **text**';
      const { data, body } = parseFrontMatter(raw);
      expect(data.title).toBe('A: B');
      expect(data.version).toBe('1.0');
      expect(data.reviewedBy).toBe('');
      expect(body.trim()).toBe('Body **text**');
    });

    it('handles CRLF line endings', () => {
      const { data, body } = parseFrontMatter('---\r\ntitle: X\r\n---\r\nHello');
      expect(data.title).toBe('X');
      expect(body.trim()).toBe('Hello');
    });

    it('returns empty data when there is no front matter', () => {
      const { data, body } = parseFrontMatter('Just text');
      expect(data).toEqual({});
      expect(body).toBe('Just text');
    });
  });

  describe('formatEffectiveDate', () => {
    it('formats an ISO date as month and year (UTC-safe)', () => {
      expect(formatEffectiveDate('2026-10-01')).toBe('October 2026');
    });
  });

  describe('getLegalDocument', () => {
    it('loads privacy and terms with required metadata and placeholders resolved', () => {
      const privacy = getLegalDocument('privacy');
      expect(privacy.meta.title).toBe('Privacy Policy & Data Protection');
      expect(privacy.body).toContain('Sensitive Personal Information');
      expect(privacy.body).not.toContain('{{');
      expect(privacy.body).toContain('https://www.beforethenumbers.org');

      const terms = getLegalDocument('terms');
      expect(terms.meta.title).toBe('Terms of Service & Clinical Disclaimer');
      expect(terms.meta.subtitle).toBe('Platform: www.beforethenumbers.org');
      expect(terms.body).not.toContain('{{');
    });

    it('throws a clear error for an unknown slug', () => {
      expect(() => getLegalDocument('nope')).toThrow(/legal document/i);
    });

    it('throws when effectiveDate is missing or invalid', () => {
      const tmp = path.join(LEGAL_CONTENT_DIR, '__tmp-test.md');
      fs.writeFileSync(tmp, '---\ntitle: T\nversion: 1\n---\nbody');
      try {
        expect(() => getLegalDocument('__tmp-test')).toThrow(/effectiveDate/);
      } finally {
        fs.unlinkSync(tmp);
      }
    });
  });

  describe('production guard: every legal markdown file', () => {
    it('has a valid effectiveDate, version and title', () => {
      const slugs = getAllLegalSlugs();
      expect(slugs.length).toBeGreaterThanOrEqual(2);
      for (const slug of slugs) {
        const doc = getLegalDocument(slug);
        expect(doc.meta.effectiveDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(doc.meta.version).toBeTruthy();
        expect(doc.meta.title).toBeTruthy();
      }
    });
  });
});
