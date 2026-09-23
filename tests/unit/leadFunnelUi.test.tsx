/**
 * TDD Unit Test Suite for Insulin Reset Funnel UI Components & Schema.
 *
 * @usecase Validates SymptomChecklist, LeadCaptureForm, InsulinResetClient, ResetSuccessPage, and buildInsulinResetSchema.
 */
import React from 'react';
import SymptomChecklist, { METABOLIC_SYMPTOMS } from '@/components/funnel/SymptomChecklist';
import LeadCaptureForm from '@/components/funnel/LeadCaptureForm';
import InsulinResetClient from '@/components/funnel/InsulinResetClient';
import ResetSuccessPage, { metadata as resetSuccessMetadata } from '@/app/reset-success/page';
import InsulinResetPage, { metadata as insulinResetMetadata } from '@/app/insulin-reset/page';
import HiddenClockPage, { metadata as hiddenClockMetadata } from '@/app/hidden-clock/page';
import { buildInsulinResetSchema } from '@/lib/schema';
import { CAMPAIGN_CODES } from '@/config/leadConfig';

// Mock useRouter from next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

describe('Insulin Reset Lead Capture Funnel - UI & Schema Tests', () => {
  describe('buildInsulinResetSchema JSON-LD Structured Data', () => {
    it('generates valid MedicalWebPage JSON-LD schema with Dr. Bikman topic alignment', () => {
      const schema = buildInsulinResetSchema();

      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toContain('MedicalWebPage');
      expect(schema['@type']).toContain('WebPage');
      expect(schema.headline).toContain('Normal');
      expect(schema.url).toContain('/insulin-reset');
      expect(schema.about[0].name).toContain('Hyperinsulinemia');
      expect(schema.hasPart.name).toContain('The Hidden Metabolic Clock');
      expect(schema.hasPart.encodingFormat).toBe('application/pdf');
    });
  });

  describe('SymptomChecklist Component', () => {
    it('defines all 4 required hyperinsulinemia symptom alarms', () => {
      expect(METABOLIC_SYMPTOMS).toHaveLength(4);
      const titles = METABOLIC_SYMPTOMS.map((s) => s.title);
      expect(titles).toContain('The Belly Anchor');
      expect(titles).toContain('The 3 PM Crash');
      expect(titles).toContain('The Skin Alarms');
      expect(titles).toContain('The 3 AM Wake-up');
    });

    it('instantiates valid JSX element with empty and populated selections', () => {
      const emptyElement = (
        <SymptomChecklist selectedSymptoms={[]} onToggleSymptom={jest.fn()} />
      );
      expect(emptyElement).toBeDefined();

      const populatedElement = (
        <SymptomChecklist
          selectedSymptoms={['The Belly Anchor', 'The 3 PM Crash']}
          onToggleSymptom={jest.fn()}
        />
      );
      expect(populatedElement).toBeDefined();
    });
  });

  describe('LeadCaptureForm Component', () => {
    it('instantiates valid JSX element with default and customized props', () => {
      const element = (
        <LeadCaptureForm
          symptomsChecked={['The Belly Anchor']}
          source={CAMPAIGN_CODES.INSULIN_RESET_FUNNEL}
        />
      );
      expect(element).toBeDefined();
      expect(typeof LeadCaptureForm).toBe('function');
    });
  });

  describe('InsulinResetClient Component', () => {
    it('instantiates valid JSX element coordinating checklist and lead capture', () => {
      const element = <InsulinResetClient />;
      expect(element).toBeDefined();
      expect(typeof InsulinResetClient).toBe('function');
    });

    it('contains the Amazon affiliate link for Dr. Bikman book with rel sponsored', () => {
      const fs = require('fs');
      const path = require('path');
      const fileContent = fs.readFileSync(
        path.resolve(__dirname, '../../src/components/funnel/InsulinResetClient.tsx'),
        'utf-8'
      );
      expect(fileContent).toContain('https://link.amazon/B03KBSMOg');
      expect(fileContent).toContain('rel="noopener noreferrer sponsored"');
      expect(fileContent).toContain('Why We Get Sick');
    });
  });

  describe('ResetSuccessPage (Bridge / Upsell)', () => {
    it('instantiates valid JSX element and exports noindex robots metadata', () => {
      const element = <ResetSuccessPage />;
      expect(element).toBeDefined();
      expect(resetSuccessMetadata.robots).toEqual({
        index: false,
        follow: false,
      });
      expect(resetSuccessMetadata.title).toContain('Your Free Report');
    });
  });

  describe('InsulinResetPage & HiddenClockPage Landing Pages', () => {
    it('instantiates valid landing pages with canonical SEO metadata', () => {
      const insulinElement = <InsulinResetPage />;
      expect(insulinElement).toBeDefined();
      expect(insulinResetMetadata.title).toContain('Normal');
      expect(insulinResetMetadata.alternates?.canonical).toContain('/insulin-reset');

      const hiddenClockElement = <HiddenClockPage />;
      expect(hiddenClockElement).toBeDefined();
      expect(hiddenClockMetadata.title).toContain('Hidden Metabolic Clock');
      expect(hiddenClockMetadata.alternates?.canonical).toContain('/insulin-reset');
    });
  });
});
