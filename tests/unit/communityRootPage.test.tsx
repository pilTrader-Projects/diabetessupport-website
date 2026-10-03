/**
 * TDD Unit Test Suite for Organic Community Root Page & Advanced SEO/GEO/AEO Schemas.
 *
 * @usecase Validates HomePage metadata, schema builders, and GlycoSense standalone pitch page.
 */
import React from 'react';
import HomePage, { metadata as homeMetadata } from '@/app/page';
import PhilippinePilotPage, { metadata as phMetadata } from '@/app/ph/page';
import GlycoSensePage, { metadata as glycoSenseMetadata } from '@/app/glycosense/page';
import { buildHomeMedicalOrgSchema, buildCommunityHomeFaqSchema, buildOrganizationSchema } from '@/lib/schema';

jest.mock('@/lib/dbConnect', () => ({
  dbConnect: jest.fn().mockResolvedValue(true),
}));

jest.mock('@/models/Post', () => ({
  PostModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            {
              _id: 'post-1',
              title: 'Top 5 Local Foods to Reverse Insulin Resistance',
              slug: 'top-5-local-foods',
              excerpt: 'Learn how traditional vegetables improve insulin sensitivity.',
            },
          ]),
        }),
      }),
    }),
  },
}));

jest.mock('@/models/Thread', () => ({
  ThreadModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

jest.mock('@/models/LearningResource', () => ({
  LearningResourceModel: {
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

describe('Organic Community Root Page & Schemas (Milestone 10)', () => {
  describe('HomePage Component & Metadata', () => {
    it('exports fully-qualified SEO/AEO metadata for Before the Numbers', () => {
      expect(homeMetadata.title).toContain('Before the Numbers');
      expect(homeMetadata.title).toContain("Don't Wait for the Diagnosis");
      expect(homeMetadata.description).toContain('Before the Numbers');
      expect(homeMetadata.keywords).toContain('before the numbers');
      expect(homeMetadata.keywords).toContain('the hidden metabolic clock');
    });

    it('renders the organic master brand homepage JSX structure', async () => {
      const element = await HomePage();
      expect(element).toBeDefined();
      expect(element.type).toBe('div');
    });
  });

  describe('PhilippinePilotPage Component & Metadata (/ph)', () => {
    it('exports fully-qualified Philippine pilot metadata', () => {
      expect(phMetadata.title).toContain('Before the Numbers Philippines');
      expect(phMetadata.description).toContain('Philippine pilot hub');
      expect(phMetadata.keywords).toContain('diabetes support philippines');
      expect(phMetadata.keywords).toContain('RA 10173 medical privacy');
    });

    it('renders the Philippine pilot JSX structure', async () => {
      const element = await PhilippinePilotPage();
      expect(element).toBeDefined();
      expect(element.type).toBe('div');
    });
  });

  describe('MedicalOrganization & FAQPage Structured Data (GEO/AEO)', () => {
    it('generates institutional MedicalOrganization schema with Philippine address for pilot', () => {
      const orgSchema = buildHomeMedicalOrgSchema();

      expect(orgSchema['@context']).toBe('https://schema.org');
      expect(orgSchema['@type']).toBe('MedicalOrganization');
      expect(orgSchema.name).toContain('Before the Numbers');
      expect(orgSchema.address?.addressCountry).toBe('PH');
    });

    it('generates conversational FAQPage schema for Answer Engines', () => {
      const faqSchema = buildCommunityHomeFaqSchema();

      expect(faqSchema['@context']).toBe('https://schema.org');
      expect(faqSchema['@type']).toBe('FAQPage');
      expect(faqSchema.mainEntity.length).toBeGreaterThanOrEqual(4);

      const questions = faqSchema.mainEntity.map((q: any) => q.name);
      expect(questions).toContain('How can I naturally reverse metabolic decline at home in the Philippines?');
      expect(questions).toContain('Why is standard fasting blood sugar not enough to detect early insulin resistance?');
      expect(questions).toContain('Is GlycoSense free and compliant with Philippine privacy laws?');
    });
  });

  describe('GlycoSensePage Standalone Route', () => {
    it('exports dedicated GlycoSense metadata and renders pitch page', async () => {
      expect(glycoSenseMetadata.title).toContain('GlycoSense');
      expect(glycoSenseMetadata.alternates?.canonical).toContain('/glycosense');

      const element = await GlycoSensePage();
      expect(element).toBeDefined();
      expect(element.type).toBe('div');
    });
  });
});
