import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  parseFrontMatter,
  getLegalDocument,
  getAllLegalSlugs,
  formatEffectiveDate,
  buildLegalMetadata,
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

    describe('validation (isolated temp directory)', () => {
      let dir: string;
      const write = (name: string, front: string) =>
        fs.writeFileSync(path.join(dir, `${name}.md`), `---\n${front}\n---\nbody`);

      beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'legal-'));
      });
      afterEach(() => {
        fs.rmSync(dir, { recursive: true, force: true });
      });

      it('throws when effectiveDate is missing', () => {
        write('a', 'title: T\nversion: 1');
        expect(() => getLegalDocument('a', dir)).toThrow(/effectiveDate/);
      });

      it('throws when effectiveDate is not a real calendar date', () => {
        write('b', 'title: T\nversion: 1\neffectiveDate: 2026-13-45');
        expect(() => getLegalDocument('b', dir)).toThrow(/effectiveDate/);
      });

      it('throws on an unknown accent instead of silently falling back', () => {
        write('c', 'title: T\nversion: 1\neffectiveDate: 2026-10-01\naccent: pink');
        expect(() => getLegalDocument('c', dir)).toThrow(/accent/);
      });

      it('lists slugs from the given directory', () => {
        write('x', 'title: T\nversion: 1\neffectiveDate: 2026-10-01');
        expect(getAllLegalSlugs(dir)).toEqual(['x']);
      });
    });
  });

  describe('buildLegalMetadata', () => {
    it('maps title, description and canonical from the document', () => {
      const meta = buildLegalMetadata(getLegalDocument('privacy'), '/privacy');
      expect(meta.title).toBe('Privacy Policy & Data Security Notice | Before the Numbers');
      expect(meta.alternates?.canonical).toBe('/privacy');
      expect(meta.description).toContain('RA 10173');
      expect(meta.openGraph?.title).toBe('Privacy Policy & Data Security Notice | Before the Numbers');
      expect(meta.openGraph?.url).toBe('https://www.beforethenumbers.org/privacy');
      expect(meta.twitter && 'card' in meta.twitter ? meta.twitter.card : undefined).toBe('summary');
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
