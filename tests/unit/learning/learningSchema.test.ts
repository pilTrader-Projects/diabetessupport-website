import {
  buildLearningHubMedicalSchema,
  buildResourceVideoSchema,
  resolveEvidenceLevel,
} from '../../../src/lib/learningSchema';
import { ILearningResource } from '../../../src/types/learning';

describe('learningSchema (Issue #44 Structured Data & Evidence Hierarchy)', () => {
  const mockResource: ILearningResource = {
    _id: 'res_1',
    title: 'How Insulin Resistance Drives Chronic Disease',
    slug: 'how-insulin-resistance-drives-disease',
    type: 'video',
    authorityName: 'Dr. Benjamin Bikman, PhD',
    authorityTitle: 'Professor of Cell Biology',
    summary: 'A deep dive into hyperinsulinemia and cellular energy partitioning.',
    keyTakeaways: ['Insulin stops lipolysis', 'Ketones are clean fuels'],
    sourceUrl: 'https://www.youtube.com/watch?v=abc12345678',
    platform: 'youtube',
    embedId: 'abc12345678',
    thumbnailUrl: 'https://img.youtube.com/vi/abc12345678/hqdefault.jpg',
    topics: ['Insulin Resistance', 'Metabolic Syndrome'],
    status: 'published',
  };

  describe('buildLearningHubMedicalSchema', () => {
    it('should generate valid MedicalWebPage schema with 3-layer authorship entities', () => {
      const schema = buildLearningHubMedicalSchema([mockResource]);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('MedicalWebPage');
      expect(schema.name).toContain('Learning');
      expect(schema.editor['@type']).toBe('Organization');
      expect(schema.editor.name).toContain('Before the Numbers Editorial Desk');
      expect(schema.reviewedBy['@type']).toBe('Organization');
      expect(schema.reviewedBy.name).toContain('Clinical Review Desk');
      expect(schema.publisher.name).toBe('Before the Numbers');
      expect(schema.hasPart).toHaveLength(1);
      expect(schema.hasPart[0].name).toBe(mockResource.title);
    });
  });

  describe('buildResourceVideoSchema', () => {
    it('should generate VideoObject schema utilizing privacy-safe youtube-nocookie.com embed URL', () => {
      const schema = buildResourceVideoSchema(mockResource);

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('VideoObject');
      expect(schema.name).toBe(mockResource.title);
      expect(schema.description).toBe(mockResource.summary);
      expect(schema.embedUrl).toContain('https://www.youtube-nocookie.com/embed/abc12345678');
      expect(schema.author.name).toBe('Dr. Benjamin Bikman, PhD');
      expect(schema.editor.name).toContain('Editorial Desk');
    });
  });

  describe('resolveEvidenceLevel', () => {
    it('should correctly classify clinical studies and meta-analyses', () => {
      expect(
        resolveEvidenceLevel({
          type: 'study',
          title: 'Systematic Review and Meta-Analysis of Low Carbohydrate Diets in Type 2 Diabetes',
        })
      ).toBe('Systematic Review & Meta-Analysis');

      expect(
        resolveEvidenceLevel({
          type: 'study',
          title: 'Randomized Controlled Trial of Intermittent Fasting vs Caloric Restriction',
        })
      ).toBe('Randomized Controlled Trial (RCT)');
    });

    it('should classify consensus guidelines and expert lectures', () => {
      expect(
        resolveEvidenceLevel({
          type: 'study',
          title: 'Standards of Medical Care in Diabetes: Consensus Guideline 2026',
        })
      ).toBe('Consensus Guideline');

      expect(
        resolveEvidenceLevel({
          type: 'video',
          title: 'Insulin Resistance Pathophysiology Masterclass',
        })
      ).toBe('Expert Clinical Lecture');
    });

    it('should prioritize explicitly defined evidenceLevel on the entity', () => {
      expect(
        resolveEvidenceLevel({
          type: 'video',
          title: 'Observational Lecture',
          evidenceLevel: 'Mechanistic & Observational Evidence',
        })
      ).toBe('Mechanistic & Observational Evidence');
    });
  });
});
