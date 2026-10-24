import React from 'react';
import ReactDOMServer from 'react-dom/server';
import RoadmapStepPage, {
  generateStaticParams,
  generateMetadata,
} from '@/app/learn/roadmap/[step]/page';
import StepDetailClient from '@/components/learning/StepDetailClient';
import { getRoadmapStepConfig, ROADMAP_STEPS } from '@/config/roadmap';
import { notFound } from 'next/navigation';

jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

jest.mock('@/analytics', () => ({
  dispatchRoadmapStepClick: jest.fn(),
  dispatchEmailSignup: jest.fn(),
  dispatchLeadMagnetDownload: jest.fn(),
}));

jest.mock('next/image', () => {
  return function MockImage(props: any) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  };
});

// Mock database and roadmap service
jest.mock('@/services/learning/roadmapService', () => {
  return {
    getRoadmapStepById: jest.fn(async (stepId: string, edition?: string) => {
      const config = getRoadmapStepConfig(stepId);
      if (!config) return null;
      return {
        step: config,
        resources: config.resourceSlugs.map((slug, idx) => ({
          _id: `mock-id-${idx}`,
          title: `Resource ${slug}`,
          slug,
          authorityName: 'Test Authority',
          status: 'published',
          editionNote: `Note for ${slug}`,
          thumbnailUrl: 'https://i.ytimg.com/vi/mock/hqdefault.jpg',
          duration: '15:00',
          summary: 'Clinical overview summary',
        })),
        edition: edition || 'global',
      };
    }),
  };
});

jest.mock('@/services/campaignService', () => ({
  CampaignService: {
    resolveCampaign: jest.fn(async () => ({
      referenceCode: 'recovery_protocol',
      name: 'Recovery Protocol',
      brevoList: 'recovery_protocol',
      defaultMetabolicStage: 'AWARENESS',
      isActive: true,
      allowWaitlist: false,
    })),
  },
}));

describe('P2-03: Roadmap Step Detail Page & Client Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Static Generation & Metadata', () => {
    it('generateStaticParams returns all 5 canonical roadmap step IDs', async () => {
      const params = await generateStaticParams();
      expect(params).toHaveLength(5);
      expect(params.map((p) => p.step)).toEqual([
        'understand',
        'spot-signs',
        'know-causes',
        'take-action',
        'stay-safe',
      ]);
    });

    it('generateMetadata generates accurate SEO title, description, and OpenGraph tags for valid step', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ step: 'understand' }),
      });

      expect(metadata.title).toContain('Step 1: Understand');
      expect(metadata.description).toContain('insulin');
    });

    it('generateMetadata returns fallback metadata when step is not recognized', async () => {
      const metadata = await generateMetadata({
        params: Promise.resolve({ step: 'non-existent-step' }),
      });

      expect(metadata.title).toContain('Step Not Found');
    });
  });

  describe('Server Component: RoadmapStepPage', () => {
    it('renders Step 1 (understand) with header, objective, resources, JSON-LD schema, and email capture', async () => {
      const pageJsx = await RoadmapStepPage({
        params: Promise.resolve({ step: 'understand' }),
      });

      const html = ReactDOMServer.renderToString(pageJsx);

      expect(html).toContain('Step 1: Understand');
      expect(html).toContain('5-Step Diabetes Recovery Roadmap');
      expect(html).toContain('Core Objective:');
      expect(html).toContain('Back to 5-Step Roadmap');
      expect(html).toContain('Download the Free Insulin Sensitivity &amp; Recovery Protocol');
      expect(html).toContain('Medical Disclaimer');
      expect(html).toContain('application/ld+json');
      expect(html).toContain('BreadcrumbList');
      expect(html).toContain('https://beforethenumbers.org/learn/roadmap/understand');
    });

    it('resolves step configuration case-insensitively with whitespace resilience', () => {
      const stepUpper = getRoadmapStepConfig('  UNDERSTAND  ');
      expect(stepUpper).toBeDefined();
      expect(stepUpper?.order).toBe(1);
    });

    it('renders ClinicalSafetyBox on Step 5 (stay-safe) with medication warning', async () => {
      const pageJsx = await RoadmapStepPage({
        params: Promise.resolve({ step: 'stay-safe' }),
      });

      const html = ReactDOMServer.renderToString(pageJsx);

      expect(html).toContain('Step 5: Stay Safe');
      expect(html).toContain('Clinical Safety &amp; Guidance Notice');
      expect(html).toContain('Do Not Adjust Medications Independently');
      expect(html).toContain('Step 5 Safety Note:');
      expect(html).toContain('severe hypoglycemia');
    });

    it('invokes notFound() when an invalid step identifier is provided', async () => {
      (notFound as unknown as jest.Mock).mockImplementation(() => {
        throw new Error('NEXT_NOT_FOUND');
      });

      await expect(
        RoadmapStepPage({
          params: Promise.resolve({ step: 'invalid-step-404' }),
        })
      ).rejects.toThrow('NEXT_NOT_FOUND');

      expect(notFound).toHaveBeenCalled();
    });

    it('renders waitlist UI on roadmap step page when campaign is inactive and allowWaitlist is true', async () => {
      const { CampaignService } = require('@/services/campaignService');
      (CampaignService.resolveCampaign as jest.Mock).mockResolvedValueOnce({
        referenceCode: 'recovery_protocol',
        name: 'Recovery Protocol',
        brevoList: 'recovery_protocol',
        defaultMetabolicStage: 'AWARENESS',
        isActive: false,
        allowWaitlist: true,
      });

      const pageJsx = await RoadmapStepPage({
        params: Promise.resolve({ step: 'understand' }),
      });

      const html = ReactDOMServer.renderToString(pageJsx);

      expect(html).toContain('Download the Free Insulin Sensitivity &amp; Recovery Protocol [Paused - Join Waitlist]');
      expect(html).toContain('Join the Waiting List');
      expect(html).toContain('Campaign Paused — Join Waiting List');
    });
  });

  describe('Client Component: StepDetailClient', () => {
    const mockStepItem = {
      step: ROADMAP_STEPS[0],
      resources: [
        {
          _id: 'r1',
          title: 'Understanding Insulin Action',
          slug: 'what-is-insulin-c4ruxp',
          authorityName: 'Dr. Jamnadas',
          status: 'published' as const,
          type: 'video' as const,
          platform: 'youtube' as const,
          sourceUrl: 'https://youtube.com/watch?v=123',
          keyTakeaways: ['Insulin stores glucose', 'Cells downregulate receptors'],
          topics: ['Insulin Resistance', 'Physiology'],
          editionNote: 'Focus on physiology fundamentals.',
          thumbnailUrl: 'https://i.ytimg.com/vi/123/hqdefault.jpg',
          duration: '14:22',
          summary: 'In-depth review of carbohydrate storage.',
        },
      ],
      edition: 'global' as const,
    };

    it('renders progress bar, resource cards, and navigation buttons cleanly', () => {
      const nextStep = ROADMAP_STEPS[1];
      const jsx = (
        <StepDetailClient
          stepItem={mockStepItem}
          prevStep={null}
          nextStep={nextStep}
          edition="global"
        />
      );

      const html = ReactDOMServer.renderToString(jsx);

      expect(html).toContain('Curriculum Progress for Step 1');
      expect(html).toContain('Understanding Insulin Action');
      expect(html).toContain('Dr. Jamnadas');
      expect(html).toContain('Focus on physiology fundamentals.');
      expect(html).toContain('Next Step');
      expect(html).toContain('Step 2: Spot the Signs');
      expect(html).toContain('Share Step');
    });

    it('renders Previous Step link when prevStep is provided', () => {
      const prevStep = ROADMAP_STEPS[0];
      const currentStep = {
        step: ROADMAP_STEPS[1],
        resources: [],
        edition: 'global' as const,
      };

      const jsx = (
        <StepDetailClient
          stepItem={currentStep}
          prevStep={prevStep}
          nextStep={null}
          edition="global"
        />
      );

      const html = ReactDOMServer.renderToString(jsx);

      expect(html).toContain('Previous Step');
      expect(html).toContain('Step 1: Understand');
      expect(html).toContain('Congratulations! Return to Full Roadmap');
    });
  });
});
